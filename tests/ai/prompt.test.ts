import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { profile } from "@/data/profile";

describe("system prompt", () => {
  const prompt = buildSystemPrompt();

  it("identifies Yvan and his title", () => {
    expect(prompt).toContain(profile.name);
    expect(prompt).toContain(profile.title);
  });

  it("carries the resume facts", () => {
    expect(prompt).toContain("Thurston");
    expect(prompt).toContain("Cagayan State University");
    expect(prompt).toContain("AQRO");
  });

  it("declares availability unpublished and forbids guessing", () => {
    expect(prompt).toContain("NOT PUBLISHED");
    expect(prompt).not.toMatch(/availability:\s*(open|freelance|employed)/i);
  });

  it("tells the model it is an AI stand-in", () => {
    expect(prompt).toMatch(/AI stand-in/i);
  });

  it("gives a contact fallback", () => {
    expect(prompt).toContain(profile.contact.email);
  });
});
