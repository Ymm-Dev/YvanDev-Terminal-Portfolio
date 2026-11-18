import { describe, expect, it } from "vitest";
import { SlidingWindowLimiter } from "@/lib/ai/rate-limit";

describe("SlidingWindowLimiter", () => {
  it("allows up to the limit, then blocks", () => {
    const now = 1_000;
    const limiter = new SlidingWindowLimiter({
      limit: 3,
      windowMs: 1_000,
      now: () => now,
    });

    expect(limiter.check("ip").ok).toBe(true);
    expect(limiter.check("ip").ok).toBe(true);
    expect(limiter.check("ip").ok).toBe(true);
    const blocked = limiter.check("ip");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("recovers after the window slides", () => {
    let now = 0;
    const limiter = new SlidingWindowLimiter({
      limit: 1,
      windowMs: 1_000,
      now: () => now,
    });

    expect(limiter.check("ip").ok).toBe(true);
    now = 1_100;
    expect(limiter.check("ip").ok).toBe(true);
  });

  it("keeps keys independent", () => {
    const limiter = new SlidingWindowLimiter({ limit: 1, windowMs: 1_000 });
    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("b").ok).toBe(true);
    expect(limiter.check("a").ok).toBe(false);
  });
});
