import io
from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from app.utils.STT import transcribe_and_translate
from app.utils.TTS import text_to_speech
from app.utils.ChatLlama import chat_llama  # You defined this with `ollama.chat(...)`
from app.utils.EditorLlama import editor_llama
import json

router = APIRouter()


class Parameter(BaseModel):
    type: str
    properties: dict
    required: list

class Function(BaseModel):
    name: str
    description: str
    parameters: Parameter

class ToolInput(BaseModel):
    type: str
    function: Function

@router.websocket("/response")
async def response(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected", flush=True)
    try:
        # Step 1: Receive tool list
        tools_data = await websocket.receive_json()
        tools = tools_data["tools"]
        print("Tools received", tools, flush=True)
        # Step 2: Receive audio stream
        frames = []
        while True:
            data = await websocket.receive_bytes()
            if data == b"END":
                break
            frames.append(data)

        audio_file = io.BytesIO(b"".join(frames))
        print("Audio received", audio_file, flush=True) 
        # Step 3: Transcribe audio
        result = transcribe_and_translate(audio_file)
        if "error" in result:
            await websocket.send_text(f"Error in the transcription {result}")
            return

        text = result["text"]
        # lang = result["language"]

        print("done transcribing", text, flush=True) 
        # Step 4: LLM: Get response from llama

        # Step 5: Parse response and generate TTS
        llama_response = None
        response_text = None

        editor_response = editor_llama(text)
        print("editor response", editor_response, flush=True)
        if "error" in editor_response:
            await websocket.send_text(f"Error in the LLM response {editor_response}")
            return

        response_json = json.loads(editor_response)
        response_text = response_json["context"]

        print("done with editor", response_json, flush=True)

        if response_json["type"] == "tool":
            print("tool response", flush=True)
            llama_response = chat_llama(text, tools)
        elif response_json["type"] == "conversation":
            print("conversation response", flush=True)
        
        print("done with llama", llama_response, flush=True) 

        if llama_response is not None and "error" in llama_response:
            await websocket.send_text(f"Error in the LLM response {llama_response}")
            return

        matched_function = None
        arguments = None
        if llama_response is not None and "message" in llama_response:
            print("message", llama_response["message"], flush=True)

            if "tool_calls" in llama_response["message"]:
                tool_calls = llama_response["message"]["tool_calls"]
                matched_function = tool_calls[0]["function"]["name"]
                arguments = tool_calls[0]["function"]["arguments"]
                print("tool call", matched_function, flush=True)
            elif "content" in llama_response["message"] and "content".__len__() > 0:
                matched_function = llama_response["message"]["content"]
                print("function call", matched_function, flush=True)

        # Step 6: Generate TTS response
        print("done with parsing", response_text, flush=True)

        # response_text = response_text.replace("\n", " ")

        tts_response = text_to_speech(response_json["language"], response_text)

        print("done with tts", tts_response, flush=True)

        if "audio_url" not in tts_response:
            await websocket.send_text("TTS error: " + tts_response.get("error", "Unknown"))
            return

        print("done base64", tts_response["audio_url"], flush=True)
        # Step 7: Send response to frontend
        await websocket.send_json({
            "audio_url": tts_response["audio_url"],
            "function_name": matched_function,
            "arguments": arguments,
            "response_text": response_text,
        })

    except Exception as e:
        await websocket.send_text(f"Error: {str(e)}")
    finally:
        await websocket.close()
