import ollama

ollama_client = ollama.Client(host="http://host.docker.internal:11434")

prompt = """
You are an expert language detector. Your job is to stictly detect the language code of the user's message and respond inside a strict JSON object.

Response Format (strict JSON only):

{
    "language": "en",
}

Output must include **only valid JSON** with correct brackets, commas, and quotes. Do NOT include:
only return the json nothing else
"""

def languageDetector(message: str) -> dict:
    try:
        response: ollama.ChatResponse =  ollama_client.chat(
            model="llama3.2:3b",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": message}
            ],
            stream=True
        )

        for chunk in response:
            if "content" in chunk["message"]:
                yield chunk["message"]["content"]
    except Exception as e:
        return {"error": str(e)}