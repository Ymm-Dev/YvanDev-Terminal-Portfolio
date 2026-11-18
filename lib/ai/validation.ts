import { z } from "zod";

export const MAX_MESSAGES = 8;
export const MAX_CHARS_PER_MESSAGE = 800;
export const MAX_TOTAL_CHARS = 6_000;

export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "model"]),
          text: z.string().trim().min(1).max(MAX_CHARS_PER_MESSAGE),
        }),
      )
      .min(1)
      .max(MAX_MESSAGES),
  })
  .superRefine((value, ctx) => {
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
