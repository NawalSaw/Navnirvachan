let currentSource: AudioBufferSourceNode | null = null;

export function stopAudio() {
  if (currentSource) {
    currentSource.stop(); // 💥 Stop playback
    currentSource = null;
  }
}

export default async function textToSpeech(text: string) {
  const response = await fetch("/api/text_to_speech", {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const reader = response.body?.getReader();
  const stream = new ReadableStream({
    start(controller) {
      const pump = () => {
        reader?.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          pump();
        });
      };
      pump();
    },
  });
  const audioData = await new Response(stream).arrayBuffer();
  const ctx = new AudioContext();
  const audioBuffer = await ctx.decodeAudioData(audioData);
  const source = ctx.createBufferSource();
  currentSource = source; // 🎯 Track the current source
  source.buffer = audioBuffer;
  source.connect(ctx.destination);

  return new Promise<void>((resolve) => {
    source.onended = () => {
      if (currentSource === source) {
        currentSource = null;
      }
      resolve(); // ✅ resolve only after audio playback ends
    };
    source.start();
  });
}
