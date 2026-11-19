import { site } from "@/data/site";
import type { ChatMessage } from "./types";

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

/**
 * Build a request payload the server will accept: drop empty assistant
 * placeholders left by a failed request, keep the newest turns, and shed the
 * oldest turns until the total fits the shared character budget.
 */
export function buildChatPayload(messages: ChatMessage[], text: string): ChatTurn[] {
  const turns: ChatTurn[] = [...messages, { role: "user" as const, text }]
    .map((message) => ({ role: message.role, text: message.text.trim() }))
    .filter((message) => message.text.length > 0)
    .slice(-site.maxChatMessages);

  while (
    turns.length > 1 &&
    turns.reduce((sum, turn) => sum + turn.text.length, 0) > site.maxChatTotalChars
  ) {
    turns.shift();
  }

  return turns;
}
