from gtts import gTTS
from io import BytesIO
import base64

def text_to_speech(text: str, lang: str = 'en') -> str:
    tts = gTTS(text=text, lang=lang)
    buffer = BytesIO()
    tts.write_to_fp(buffer)
    buffer.seek(0)
    audio_bytes = buffer.read()
    return base64.b64encode(audio_bytes).decode('utf-8')
