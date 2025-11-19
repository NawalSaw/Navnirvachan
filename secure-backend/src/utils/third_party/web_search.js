import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const prompt =
  "Search the web for the latest news on the given topic. Provide a summary of the news in bullet points.";

export async function webSearch(topic) {
  const res = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `${prompt}`,
      },
      {
        role: "user",
        content: `${topic}`,
      },
    ],
    model: "groq/compound-mini",
    max_completion_tokens: 200,
  });

  if (!res.choices[0].message.content) {
    throw new Error("No response from Groq API");
  }

  return res.choices[0].message.content;
}
