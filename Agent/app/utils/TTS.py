from gtts import gTTS
import os
import uuid

AUDIO_DIR = "static/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)

def text_to_speech(language: str, text: str):
    try:
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)

        tts = gTTS(text=text, lang=language, slow=False)
        tts.save(filepath)

        return {"audio_url": f"/static/audio/{filename}"}
    except ValueError as ve:
        return {"error": f"Invalid language code: {ve}"}
    except Exception as e:
        return {"error": str(e)}
