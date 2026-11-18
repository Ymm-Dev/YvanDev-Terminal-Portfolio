import { afterEach, describe, expect, it, vi } from "vitest";
import { getProvider } from "@/lib/ai/provider";

describe("provider selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to the offline provider when there is no key", () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    const provider = getProvider();
    expect(provider.id).toBe("offline");
    expect(provider.configured).toBe(false);
  });

  it("honours an explicit offline choice even with a key present", () => {
    vi.stubEnv("AI_PROVIDER", "offline");
    vi.stubEnv("GEMINI_API_KEY", "not-a-real-key");
    expect(getProvider().id).toBe("offline");
  });

  it("uses Gemini when a key is present and no provider is forced", () => {
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("GEMINI_API_KEY", "not-a-real-key");
    const provider = getProvider();
    expect(provider.id).toBe("gemini");
    expect(provider.configured).toBe(true);
  });

  it("reports configured=false for Gemini without a key", () => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(getProvider().configured).toBe(false);
  });
});
