import ollama

ollama_client = ollama.Client(host="http://host.docker.internal:11434")
prompt = """
You are an expert classifier. Your job is to strictly classify the user's message as either a tool command or a general conversation and respond inside a strict JSON object.

Available Tool Commands:

1. **Redirect**: Redirect the user to another page within the Navnirvachan web app (running on localhost).
2. **Highlight**: Highlight a specific button or element on the current page.

Classification Rules:

- If the user asks to go to a page like "vote", "results", "home", etc., classify it as **tool**.
- If the user asks where something is or can't find a button, classify it as **tool**.
- If the message doesn't clearly match a tool category, classify it as a **conversation**.
- Do **not** guess “tool” if you're unsure. Instead, classify it as a conversation.

Response Format (strict JSON only):
For a tool:
{
  "type": "tool",
}

For a conversation:
{
  "type": "conversation",
}

Output must include **only valid JSON** with correct brackets, commas, and quotes. Do NOT include:
- Any explanation outside the JSON.
- Any fallback like: "You have entered an unknown input."

you have to strictly follow the above rules.
And response in single strict json format in any case and must include all the field,
do not include the back slashes or any other characters.
"""

def Classifier(message: str) -> dict:
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
    