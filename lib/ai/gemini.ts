import { GoogleGenAI } from "@google/genai";
import type { ChatProvider, StreamRequest } from "./provider";

export const DEFAULT_MODEL = "gemini-2.5-flash";

export function createGeminiProvider(): ChatProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const configured = Boolean(apiKey);

  return {
    id: "gemini",
    model,
    configured,
    async *stream({ messages, system, signal }: StreamRequest) {
      if (!apiKey) {
        throw new Error("missing_api_key");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContentStream({
        model,
        contents: messages.map((message) => ({
          role: message.role,
          parts: [{ text: message.text }],
        })),
        config: {
          systemInstruction: system,
          temperature: 0.6,
          maxOutputTokens: 700,
          abortSignal: signal,
        },
      });

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) yield text;
      }
    },
  };
}
