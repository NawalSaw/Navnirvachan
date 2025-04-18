import ollama

ollama_client = ollama.Client(host="http://host.docker.internal:11434")

prompt = """
Your are Navin a AI agent that can answer questions about the Navnirvachan web app.
"""

def text_response(message: str):
    try:
        response: ollama.ChatResponse = ollama_client.chat(
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