import { Ollama } from "ollama";

const ollama = new Ollama({
  host: `http://localhost:${process.env.OLLAMA_PORT || 11434}`,
});

export async function llama(message) {
  console.log("llama initialized");
  const response = await ollama.chat({
    model: "llama3.2:1b",
    messages: [{ role: "user", content: message }],
    stream: true,
  });
  //   console.log(response);
  return response;
}
