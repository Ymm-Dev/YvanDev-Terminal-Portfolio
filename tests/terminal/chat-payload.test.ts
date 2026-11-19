import { describe, expect, it } from "vitest";
import { buildChatPayload } from "@/lib/terminal/chat-payload";
import type { ChatMessage } from "@/lib/terminal/types";

const msg = (
  role: ChatMessage["role"],
  text: string,
  at = 0,
): ChatMessage => ({ id: `${role}-${at}-${text.length}`, role, text, at });

describe("buildChatPayload", () => {
  it("drops empty assistant placeholders left by a failed request", () => {
    const payload = buildChatPayload([msg("user", "hi"), msg("model", "")], "again");
    expect(payload).toEqual([
      { role: "user", text: "hi" },
      { role: "user", text: "again" },
    ]);
  });

  it("keeps the newest turns within the message limit", () => {
    const history = Array.from({ length: 10 }, (_, index) =>
      msg(index % 2 === 0 ? "user" : "model", `turn ${index}`, index),
    );
    const payload = buildChatPayload(history, "latest");
    expect(payload).toHaveLength(8);
    expect(payload[payload.length - 1]).toEqual({ role: "user", text: "latest" });
  });

  it("drops the oldest turns to stay inside the total character budget", () => {
    const history = [
      msg("user", "x".repeat(800)),
      msg("model", "y".repeat(5_990), 1),
      msg("user", "z".repeat(800), 2),
    ];
    const payload = buildChatPayload(history, "latest");

    expect(payload.reduce((sum, item) => sum + item.text.length, 0)).toBeLessThanOrEqual(
      6_000,
    );
    expect(payload[payload.length - 1]).toEqual({ role: "user", text: "latest" });
    expect(payload.some((item) => item.text.startsWith("x"))).toBe(false);
  });
});
