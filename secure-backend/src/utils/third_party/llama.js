import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function llama(prompt) {
  const res = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.1-8b-instant",
    max_completion_tokens: 200,
  });
  
  if (!res.choices[0].message.content) {
    throw new Error("No response from Groq API");
  }

  return res.choices[0].message.content;
}
