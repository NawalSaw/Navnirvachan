import speech_recognition as sr


def Transcribe_realtime(audio_bytes):        
        # Suppose `audio_bytes` is your incoming raw audio data (PCM WAV-like bytes)
        # You must know the sample rate and sample width (bytes per sample)

        # Example values (modify according to your source)
        sample_rate = 16000        # 16 kHz common for STT
        sample_width = 2           # 2 bytes (16-bit audio)
        channels = 1               # Mono audio

        # Create a recognizer instance
        recognizer = sr.Recognizer()

        # Wrap your raw byte data as AudioData
        audio_data = sr.AudioData(audio_bytes, sample_rate, sample_width)

        # Transcribe the audio
        try:
            text = recognizer.recognize_google(audio_data)
            print("Transcribed:", text)
            return text
        except sr.UnknownValueError:
            print("Could not understand audio")
            return None
        except sr.RequestError as e:
            print("Request error:", e)
            return f"Error in transcription: {e}"
