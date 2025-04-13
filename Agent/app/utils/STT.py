from deep_translator import GoogleTranslator
from pydub import AudioSegment
import speech_recognition as sr
import io

def transcribe_and_translate(audio_file):
    try:
        print("Transcribing audio...", flush=True)
        audio = AudioSegment.from_file(audio_file)
        audio = audio.set_frame_rate(16000).set_channels(1)

        converted_audio = io.BytesIO()
        audio.export(converted_audio, format="wav")
        converted_audio.seek(0)

        recognizer = sr.Recognizer()

        with sr.AudioFile(converted_audio) as source:
            audio_data = recognizer.record(source)

        transcribed_text = recognizer.recognize_google(audio_data)

        print("Transcription:", transcribed_text, flush=True)
        # translated_text = GoogleTranslator(source="auto").translate(transcribed_text)

        return {"text": transcribed_text}

    except sr.UnknownValueError:
        return {"error": "Could not understand the audio"}
    except sr.RequestError:
        return {"error": "Could not connect to Google Speech API"}
    except Exception as e:
        return {"error": str(e)}
