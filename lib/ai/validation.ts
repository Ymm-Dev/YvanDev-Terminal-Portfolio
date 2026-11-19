import { z } from "zod";
import { site } from "@/data/site";

export const MAX_MESSAGES = site.maxChatMessages;
export const MAX_CHARS_PER_MESSAGE = site.maxChatChars;
export const MAX_TOTAL_CHARS = site.maxChatTotalChars;

export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "model"]),
          // Assistant replies can be longer than a visitor's input, but every
          // turn still gets a hard ceiling before the total budget is checked.
          text: z.string().trim().min(1).max(MAX_TOTAL_CHARS),
        }),
      )
      .min(1)
      .max(MAX_MESSAGES),
  })
  .superRefine((value, ctx) => {
    for (const [index, message] of value.messages.entries()) {
      if (message.role === "user" && message.text.length > MAX_CHARS_PER_MESSAGE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "message is too long",
          path: ["messages", index, "text"],
        });
      }
    }
    const total = value.messages.reduce((sum, message) => sum + message.text.length, 0);
    if (total > MAX_TOTAL_CHARS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "conversation is too long",
        path: ["messages"],
      });
    }
    const last = value.messages[value.messages.length - 1];
    if (!last || last.role !== "user") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "the last message must be from the visitor",
        path: ["messages"],
      });
    }
  });

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export function normaliseMessages(
  messages: ChatRequest["messages"],
): { role: "user" | "model"; text: string }[] {
  // Collapse consecutive same-role turns so the provider always sees an
  // alternating conversation, and keep the newest 8.
  const collapsed: { role: "user" | "model"; text: string }[] = [];
  for (const message of messages) {
    const previous = collapsed[collapsed.length - 1];
    if (previous && previous.role === message.role) {
      previous.text = `${previous.text}\n${message.text}`;
    } else {
      collapsed.push({ role: message.role, text: message.text });
    }
  }
  const trimmed = collapsed.slice(-MAX_MESSAGES);
  while (trimmed.length && trimmed[0]?.role === "model") trimmed.shift();
  return trimmed;
}
