import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { profile } from "@/data/profile";

describe("system prompt", () => {
  const prompt = buildSystemPrompt();

  it("identifies Yvan and his title", () => {
    expect(prompt).toContain(profile.name);
    expect(prompt).toContain(profile.title);
  });

  it("requires first-person answers and forbids third-person references", () => {
    expect(prompt).toContain("Never refer to Yvan in the third person");
  });

  it("carries the resume facts", () => {
    expect(prompt).toContain("Thurston");
    expect(prompt).toContain("Cagayan State University");
    expect(prompt).toContain("AQRO");
  });

  it("states the published availability", () => {
    expect(prompt).toContain("Availability: Open to work (published by Yvan).");
  });

  it("forbids guessing when availability is unpublished", () => {
    const hidden = buildSystemPrompt({
      ...profile,
      availability: { published: false },
    });
    expect(hidden).toContain("NOT PUBLISHED");
    expect(hidden).not.toMatch(/open to work/i);
  });

  it("tells the model it is an AI stand-in", () => {
    expect(prompt).toMatch(/AI stand-in/i);
  });

  it("gives a contact fallback", () => {
    expect(prompt).toContain(profile.contact.email);
  });
});
