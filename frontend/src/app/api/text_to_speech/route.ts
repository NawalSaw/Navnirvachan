import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 500 });
  }

  const { text } = await request.json();
  if (!text) {
    return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
  }

  const deepgram = createClient(apiKey);
  const response = await deepgram.speak.request(
    { text },
    {
      model: "aura-asteria-en",
    }
  );

  const dgStream = await response.getStream();
  if (!dgStream) {
    return NextResponse.json({ error: "No audio stream" }, { status: 500 });
  }

  const reader = dgStream.getReader(); // ✅ convert to reader

  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked", // optional, helps with progressive delivery
    },
  });
}
