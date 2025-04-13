"use client";

import { Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function VoiceAgentPage() {
  const [recording, setRecording] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // tools=[{
  //        'type': 'function',
  //        'function': {
  //          'name': 'get_current_weather',
  //          'description': 'Get the current weather for a city',
  //          'parameters': {
  //           'type': 'object',
  //            'properties': {
  //              'city': {
  //                'type': 'string',
  //                'description': 'The name of the city',
  //              },
  //            },
  //            'required': ['city'],
  //          },
  //        },
  //    },
  // ],

  const tools = [
    {
      type: "function",
      function: {
        name: "redirectUser",
        description: "Redirect the user to a specific URL within the website.",
        parameters: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "the complete url of the site to redirect to",
            },
          },
          required: ["url"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "highlight_button",
        description: "Highlight a specific button on the website.",
        parameters: {
          type: "object",
          properties: {
            button_id: {
              type: "string",
              description: "the id of the button to highlight",
            },
          },
          required: ["button_id"],
        },
      },
    },
  ];

  const playBase64Audio = (base64: string) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);

    audio.addEventListener("canplaythrough", () => {
      audio.play().catch((err) => console.error("Playback failed", err));
    });

    audio.load();
  };

  const redirectUser = ({ url }: { url: string }) => {
    window.location.href = url;
  };
  
  const highlight_button = ({ button_id }: { button_id: string }) => {
    const button = document.getElementById(button_id);
    if (button) {
      button.style.outline = "3px solid yellow";
      button.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  
  const functionMap: Record<string, (args: any) => void> = {
    redirectUser,
    highlight_button,
  };

  const startWebSocket = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)
        return resolve();

      socketRef.current = new WebSocket("ws://localhost:5001/api/v1/response");
      socketRef.current.binaryType = "arraybuffer"; // 🔑 Ensure binary communication

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
        socketRef.current?.send(JSON.stringify({ tools }));
        resolve();
      };

      socketRef.current.onmessage = (event) => {
        console.log(event);

        const msg = JSON.parse(event.data);
        const audio = new Audio(`http://localhost:5001${msg.audio_url}`);

        audio.play();

        if (msg.function_name) {
          console.log("Calling function:", msg.function_name);
          const args = msg.arguments || {}; // assuming backend sends this
          functionMap[msg.function_name](args); // ✨ dynamic invocation
        }
      };

      socketRef.current.onerror = (err) => {
        console.error("WebSocket error", err);
        reject();
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket closed");
        socketRef.current = null;
      };
    });
  };

  const startRecording = async () => {
    await startWebSocket(); // ⏳ Wait for WebSocket to be ready before recording

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
        const buffer = await e.data.arrayBuffer(); // Convert to bytes
        console.log(buffer);
        socketRef.current.send(buffer);
      }
    };

    mediaRecorder.onstop = () => {
      socketRef.current?.send(new TextEncoder().encode("END")); // ✅ Sends raw bytes
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start(250);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div>
      {recording ? (
        <Mic
          onClick={stopRecording}
          className="cursor-pointer text-red-500"
          size={30}
        />
      ) : (
        <Mic
          onClick={startRecording}
          className="cursor-pointer text-white"
          size={30}
        />
      )}
    </div>
  );
}
