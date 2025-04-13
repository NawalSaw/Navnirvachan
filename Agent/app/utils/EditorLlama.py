import ollama

ollama_client = ollama.Client(host="http://host.docker.internal:11434")


def editor_llama(message: str) -> dict:
    try:
        response: ollama.ChatResponse =  ollama_client.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "system",
                    "content":  """
You are an expert classifier. Your job is to strictly classify the user's message as either a tool command or a general conversation, and respond with a helpful explanation inside a strict JSON object.

Available Tool Commands:

1. **Redirect**: Redirect the user to another page within the Navnirvachan web app (running on localhost).
2. **Highlight**: Highlight a specific button or element on the current page.

Classification Rules:

- If the user asks to go to a page like "vote", "results", "home", etc., classify it as **tool**.
- If the user asks where something is or can't find a button, classify it as **tool**.
- If the message doesn't clearly match a tool category, classify it as a **conversation**.
- Do **not** guess “tool” if you're unsure. Instead, classify it as a conversation.

you have to add a language code in which you are responding to your response in the language field in the english letters. 

Response Format (strict JSON only):

For a tool:
{
  "type": "tool",
  "language": "en",
  "context": "A clear and short explanation like 'You will be redirected to the voting page.' or 'The vote button will be highlighted on the page.'"
}

For a conversation:
{
  "type": "conversation",
  "language": "en",
  "context": "Your natural, helpful assistant-style response."
}

Output must include **only valid JSON** with correct brackets, commas, and quotes. Do NOT include:
- Any explanation outside the JSON.
- Any fallback like: "You have entered an unknown input."

you have to strictly follow the above rules.
And response in single strict json format in any case and must include all the field,
do not include the back slashes or any other characters.
"""
                },{
                    "role": "user",
                    "content": message
                }],
                )
    except Exception as e:
        return {"error": str(e)}
    
    return response["message"]["content"]
    