import { describe, expect, it } from "vitest";
import {
  MAX_MESSAGES,
  chatRequestSchema,
  normaliseMessages,
} from "@/lib/ai/validation";

const user = (text: string) => ({ role: "user" as const, text });

describe("chat request validation", () => {
  it("accepts a normal conversation", () => {
    const result = chatRequestSchema.safeParse({
      messages: [user("Tell me about yourself.")],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty conversation", () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it("rejects too many messages", () => {
    const messages = Array.from({ length: MAX_MESSAGES + 1 }, (_, i) =>
      user(`message ${i}`),
    );
    expect(chatRequestSchema.safeParse({ messages }).success).toBe(false);
  });

  it("rejects an oversized message", () => {
    expect(chatRequestSchema.safeParse({ messages: [user("x".repeat(801))] }).success).toBe(
      false,
    );
  });

  it("rejects a total over the conversation budget", () => {
    const messages = Array.from({ length: 8 }, () => user("x".repeat(790)));
    expect(chatRequestSchema.safeParse({ messages }).success).toBe(false);
  });

  it("requires the last turn to come from the visitor", () => {
    const result = chatRequestSchema.safeParse({
      messages: [user("hi"), { role: "model", text: "hello" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("normaliseMessages", () => {
  it("collapses consecutive same-role turns", () => {
    const result = normaliseMessages([
      user("one"),
      user("two"),
      { role: "model", text: "reply" },
      user("three"),
    ]);
    expect(result).toEqual([
      { role: "user", text: "one\ntwo" },
      { role: "model", text: "reply" },
      { role: "user", text: "three" },
    ]);
  });

  it("drops leading model turns", () => {
    expect(
      normaliseMessages([{ role: "model", text: "stale" }, user("hi")]),
    ).toEqual([{ role: "user", text: "hi" }]);
  });
});
