import ollama

ollama_client = ollama.Client(host="http://host.docker.internal:11434")



def chat_llama(message: str, tools: list) -> ollama.ChatResponse:
    try:
       response: ollama.ChatResponse = ollama_client.chat(
        model = "llama3.2:3b",
        messages = [
{
  "role": "system",
  "content": """
You are Navin, a helpful assistant in a voting app in India.

Routes in the app:
- http://localhost:3000/register — to register
- http://localhost:3000/vote — to vote
- http://localhost:3000/result — to view results

You must only use the above routes.
"""
},

            {"role": "user", "content": message }
        ],
        tools = tools

    )
    except Exception as e:
        return {"error": str(e)}
    return response