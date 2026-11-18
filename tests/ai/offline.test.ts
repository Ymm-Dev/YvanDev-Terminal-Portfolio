import { describe, expect, it } from "vitest";
import { createOfflineProvider, OFFLINE_MESSAGE } from "@/lib/ai/offline";

describe("offline provider", () => {
  it("is not configured and says so", () => {
    const provider = createOfflineProvider();
    expect(provider.configured).toBe(false);
    expect(provider.id).toBe("offline");
  });

  it("streams a labelled message the visitor can act on", async () => {
    const provider = createOfflineProvider();
    let text = "";
    for await (const chunk of provider.stream({ messages: [], system: "" })) {
      text += chunk;
    }
    expect(text).toBe(OFFLINE_MESSAGE);
    expect(text).toMatch(/isn't connected/i);
    expect(text).toContain("recruiter");
  });
});
