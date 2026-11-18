export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface StreamRequest {
  messages: ChatTurn[];
  system: string;
  signal?: AbortSignal;
}

export interface ChatProvider {
  id: string;
  model?: string;
  configured: boolean;
  stream(request: StreamRequest): AsyncIterable<string>;
}

export { createGeminiProvider } from "./gemini";
export { createOfflineProvider } from "./offline";
export { buildSystemPrompt } from "./prompt";

import { createGeminiProvider } from "./gemini";
import { createOfflineProvider } from "./offline";

/**
 * Provider selection is intentionally trivial to swap: the browser never sees
 * anything but text chunks, and the route only talks to this interface.
 */
export function getProvider(): ChatProvider {
  const requested = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
  if (requested === "offline") return createOfflineProvider();
  if (requested === "gemini") return createGeminiProvider();
  // Auto: use Gemini when a key is present, otherwise stay honest and offline.
  return process.env.GEMINI_API_KEY
    ? createGeminiProvider()
    : createOfflineProvider();
}
