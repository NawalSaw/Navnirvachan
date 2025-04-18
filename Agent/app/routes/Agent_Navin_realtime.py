from fastapi import APIRouter, WebSocket
from app.utils.realtime.STT import Transcribe_realtime
from app.utils.realtime.TTS import text_to_speech
from app.utils.realtime.Classifier import Classifier
from app.utils.realtime.Worker import worker
from app.utils.realtime.Formater import text_response
from app.utils.realtime.languageDetector import languageDetector
import struct
import json

router = APIRouter()


def is_silent(audio_bytes: bytes, silence_threshold: int = 500) -> bool:
    """
    Detect if the PCM audio chunk is silent by checking average amplitude.
    
    :param audio_bytes: Raw PCM audio (16-bit mono)
    :param silence_threshold: Amplitude below which it's considered silence
    :return: True if silent
    """
    # Convert bytes to an array of signed 16-bit samples
    num_samples = len(audio_bytes) // 2
    format = f"{num_samples}h"  # 'h' is 16-bit signed short
    samples = struct.unpack(format, audio_bytes)

    # Calculate average amplitude
    avg_amplitude = sum(abs(sample) for sample in samples) / num_samples
    return avg_amplitude < silence_threshold

def get_required_args_for_tool(tool_name: str) -> list:
    # You should ideally have a mapping of tool → required args
    TOOL_ARGS = {
        "register_user": ["name", "image", "aadhaar", "address", "phone", "email"],
        "schedule_meeting": ["time", "participants", "topic"],
        # Add your tools here
    }
    return TOOL_ARGS.get(tool_name, [])

def extract_tool_info(message):
    if "tool_calls" in message:
        return json.loads(json.dumps(message["tool_calls"][0]))  # safe parsing
    elif "content" in message:
        return json.loads(message["content"])
    return None

@router.websocket("/agent")
async def response(websocket: WebSocket):

    await websocket.accept()
    print("WebSocket connected", flush=True)

    audio_buffer = bytearray()
    min_bytes_for_1s = 16000 * 2  # 16kHz * 2 bytes (16-bit PCM mono) = 32,000 bytes/sec

    try:
        # Step 1: Receive tool list

        tools_data = await websocket.receive_json()
        tools = tools_data["tools"]
        print("Tools received", tools, flush=True)

        # Step 2: Receive audio stream
        transcribed_text_full = ""
        silent_chunks = 0
        max_silent_chunks = 3  # ~3 seconds of silence

        while True:
            data = await websocket.receive_bytes()

            if is_silent(data):
                silent_chunks += 1
                if silent_chunks > max_silent_chunks:
                    break
                continue
            else:
                silent_chunks = 0  # reset when speech resumes


            audio_buffer.extend(data)

            # Once we have enough audio for 1 second, transcribe

            if len(audio_buffer) >= min_bytes_for_1s:

                transcribed_text = Transcribe_realtime(
                    audio_buffer[:min_bytes_for_1s]
                )

                if transcribed_text:
                    transcribed_text_full += transcribed_text
                    await websocket.send_json({"transcription": transcribed_text})

                # Clear the used buffer

                audio_buffer = audio_buffer[min_bytes_for_1s:]

        # Step 4: Classify
        chunks = Classifier(transcribed_text_full)
        classification_str = ''.join([chunk for chunk in chunks])
        jsoned_classifications = json.loads(classification_str)

        # Step 5: Conditional response
        functions = []
        arguments = []

        if jsoned_classifications["type"] == "tool":
            context = transcribed_text_full
            while True:
                    worker_response = worker(context, tools)

                    if worker_response["error"]:
                        await websocket.send_text(worker_response["error"])
                        break

                    message = worker_response.get("message", {})

                    tool_call = extract_tool_info(message)
                    func_name = tool_call["function"]["name"]
                    args = json.loads(tool_call["function"]["arguments"])
                    required_args = get_required_args_for_tool(func_name)  # your custom logic

                    missing_args = [arg for arg in required_args if not args.get(arg)]

                    if missing_args:
                        missing_arg_name = missing_args[0]
                        audio_base64 = text_to_speech(f"Please provide the {missing_arg_name}.")
                        await websocket.send_json({
                            "type": "missing_argument",
                            "field": missing_arg_name,
                            "audio_base64": audio_base64,
                            "message": f"Please provide the {missing_arg_name}."
                        })

                        # Wait for user’s reply
                        user_reply = await websocket.receive_json()
                        user_response_text = user_reply.get("text", "")
                        context += f" {user_response_text}"
                        continue  # re-run worker with new context

                    else:
                        # All arguments provided, run the tool
                        functions.append(func_name)
                        arguments.append(args)

                        audio_base64 = text_to_speech(f"Running {func_name} with the provided information.")
                        await websocket.send_json({
                            "type": "tool_call",
                            "audio_base64": audio_base64,
                            "functions": functions,
                            "arguments": arguments,
                            "conversation": f"Running {func_name}..."
                        })
                        break  # tool call handled, exit loop



        # TODO: format the message and TTS                      
        elif jsoned_classifications["type"] == "conversation":
            conversations = text_response(transcribed_text_full, tools)

            lang_chunks = languageDetector(conversations[0])
            lang_json_str = ''.join([chunk for chunk in lang_chunks])
            languageJson = json.loads(lang_json_str)

            for conversation in conversations:
                audio_base64 = text_to_speech(conversation, languageJson["language"])
                await websocket.send_json({
                    "type": "conversation",
                    "audio_base64": audio_base64,
                    "functions": None,
                    "arguments": None,
                    "conversation": conversation
                })


    except Exception as e:
        print(f"Error in agent navin: {e}", flush=True)
        await websocket.send_text(f"Error: {str(e)}")
        await websocket.close()
    