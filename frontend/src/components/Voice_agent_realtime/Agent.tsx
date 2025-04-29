"use client";

import { useRef, useState, useEffect } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { Groq } from "groq-sdk";
import textToSpeech, { stopAudio } from "@/hooks/useTextToSpeech";
import { Mic } from "lucide-react";
import { tools } from "@/lib/utils";

const localToolFunctions = {
  redirectUser: async (args: { url: string }) => {
    console.log("Redirecting to:", args.url);
    window.location.href = args.url; // simple redirect
    return "Redirecting... to " + args.url;
  },

  registerUser: async (args: { aadhaarID: string; otp: string }) => {
    console.log("Registering user:", args.aadhaarID, args.otp);

    if (!args.otp && args.aadhaarID) {
      alert("sent a otp");
      return;
    }
    // You can call your backend API here if you want
    alert(
      `Registering user with Aadhaar ID: ${args.aadhaarID} and OTP: ${args.otp}`
    );

    return "Registered user with Aadhaar ID: " + args.aadhaarID;
  },
};

const LOCAL_STORAGE_KEY = "navin_ai_messages";

const SYSTEM_MESSAGE = {
  role: "system",
  content: `
    You are Navin, a voice AI assistant for the voting app. 
    Respond in maximum 50 words. 
    You are provided with the following tools: redirectUser and registerUser ONLY.
    
    DO NOT invent or call any tool that is not listed.
    IF YOU ARE CONFUSED RESPOND WITH NORMAL RESPONSE.

    If no matching tool is available, reply normally without calling any tool.
    Ask the user for missing parameters when needed.

    if you are calling any tool function always call it in the tool_calls inside the message object NOT in message.content.

    In the case of registerUser you have to ask the user for Aadhaar ID first and call the tool then the user will receive the OTP on their phone then ask for the OTP and call the tool for registering. 
  `,
};

export default function Agent() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");

  const messagesRef = useRef<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false); // Lock while handling response
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          messagesRef.current = JSON.parse(saved);
        } catch {
          messagesRef.current = [SYSTEM_MESSAGE];
        }
      } else {
        messagesRef.current = [SYSTEM_MESSAGE];
      }
    }
  }, []);

  const saveMessages = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(messagesRef.current)
      );
    }
  };

  // Init Deepgram
  const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!);

  // 🔁 Re-initialize Deepgram connection
  const localConnection = deepgram.listen.live({
    model: "nova-3",
    smart_format: true,
  });

  // Init Groq
  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
    dangerouslyAllowBrowser: true,
  });

  const startListening = async () => {
    if (isListening) return;
    try {
      textToSpeech("hello! how can I help you today?");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      setIsListening(true);

      recorder.start(500);

      localConnection.on(LiveTranscriptionEvents.Transcript, handleTranscript); // move this here
      localConnection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error("Deepgram error:", err);
      });
      recorder.ondataavailable = (e) => {
        localConnection.send(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;

        localConnection.off(
          LiveTranscriptionEvents.Transcript,
          handleTranscript
        );
      };
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.stop();
    }

    messagesRef.current = [];
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Handle Deepgram transcripts
  const handleTranscript = async (data: any) => {
    const transcriptText = data.channel.alternatives[0].transcript;
    if (!transcriptText) return;

    if (isProcessingRef.current) {
      stopAudio();
      abortControllerRef.current?.abort(); // abort Groq stream
    }

    isProcessingRef.current = true;
    setTranscript(transcriptText);

    const fulltext = await handleGroqResponse(transcriptText);
    setResponseText(fulltext);

    // 🧠 Don't block further transcript events
    try {
      await textToSpeech(fulltext); // ⏳ Wait until TTS finishes
    } catch (err) {
      console.warn("TTS error or interruption", err);
    }

    isProcessingRef.current = false;
  };

  // Groq processing
  // ... (previous imports and constants remain the same)

  const handleGroqResponse = async (text: string): Promise<string> => {
    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const MAX_HISTORY = 5;

      messagesRef.current.push({ role: "user", content: text });

      const systemMessage = messagesRef.current.find(
        (m) => m.role === "system"
      );
      const nonSystemMessages = messagesRef.current.filter(
        (m) => m.role !== "system"
      );

      const trimmedMessages = [
        systemMessage ?? SYSTEM_MESSAGE,
        ...nonSystemMessages.slice(-MAX_HISTORY),
      ];

      const response = await groq.chat.completions.create(
        {
          model: "meta-llama/llama-4-maverick-17b-128e-instruct",
          messages: trimmedMessages,
          // @ts-ignore - Remove if proper types are available
          tools: tools,
          tool_choice: "auto",
        },
        { signal: abortController.signal }
      );

      const assistantMessage = response.choices[0].message;
      const assistantContent = assistantMessage.content || "";

      messagesRef.current.push({
        role: "assistant",
        content: assistantContent,
        tool_calls: assistantMessage.tool_calls,
      });
      saveMessages();

      if (assistantMessage.tool_calls) {
        const toolCall = assistantMessage.tool_calls[0];
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments); // Parse JSON string

        if (!["redirectUser", "registerUser"].includes(toolName)) {
          console.warn("Model tried calling unknown tool:", toolName);
          return "I can't perform that action.";
        }

        try {
          // Execute the tool function
          // @ts-ignore
          const result = await localToolFunctions[toolName](toolArgs);

          // Add tool response to messages
          messagesRef.current.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: JSON.stringify(result),
          });
          saveMessages();

          // Get final response from Groq
          const secondResponse = await groq.chat.completions.create({
            model: "meta-llama/llama-4-maverick-17b-128e-instruct",
            messages: messagesRef.current.slice(-MAX_HISTORY * 2), // Adjust based on needed context
          });

          const finalResponse = secondResponse.choices[0].message.content || "";
          messagesRef.current.push({
            role: "assistant",
            content: finalResponse,
          });
          saveMessages();

          return finalResponse;
        } catch (toolError) {
          console.error("Tool execution failed:", toolError);
          return "Sorry, I encountered an error performing that action.";
        }
      }

      return assistantContent || "I'm sorry, I didn't catch that.";
    } catch (err: any) {
      if (err.name === "AbortError") return "";
      console.error("Groq error:", err);
      return "I'm sorry, something went wrong.";
    }
  };

  // ... (rest of the component remains the same)

  return (
    <div>
      {isListening ? (
        <Mic className="text-red-500" onClick={stopListening} />
      ) : (
        <Mic className="text-white" onClick={startListening} />
      )}
      {/* <p className="text-white">Transcript: {transcript}</p>
      <p className="text-white">AI: {responseText}</p> */}
    </div>
  );
}
