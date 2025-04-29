import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import internal from "stream";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function readableStreamToBuffer(
  stream: internal.Readable
): Promise<Buffer> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export const tools = [
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
            enum: ["http://localhost:3000/vote", "http://localhost:3000/register"],
            description: "The URL to redirect to.",
          },
        },
        required: ["url"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "registerUser",
      description: "Authenticate the user to the website.",
      parameters: {
        type: "object",
        properties: {
          aadhaarID: {
            type: "string",
            description: "The aadhaar Id of the user",
          },
          otp: {
            type: "string",
            description: "The OTP which is sent to the user in the given aadhaar ID",
          },
        },
        required: ["aadhaarID"],
      },
    },
  },
]

