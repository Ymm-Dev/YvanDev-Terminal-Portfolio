export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  hits: number[];
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
  maxKeys?: number;
}

/**
 * Sliding-window limiter held in process memory. On Vercel each instance has
 * its own map, which is a real limitation, so keep the limits conservative and
 * document the Upstash upgrade path. The interface is what matters: swap the
 * store, not the call sites.
 */
export class SlidingWindowLimiter {
  private buckets = new Map<string, Bucket>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;
  private readonly maxKeys: number;

  constructor(options: RateLimitOptions) {
    this.limit = options.limit;
    this.windowMs = options.windowMs;
    this.now = options.now ?? Date.now;
    this.maxKeys = options.maxKeys ?? 5_000;
  }

  check(key: string): RateLimitResult {
    const time = this.now();
    const cutoff = time - this.windowMs;
    const bucket = this.buckets.get(key) ?? { hits: [] };
    bucket.hits = bucket.hits.filter((hit) => hit > cutoff);

    if (bucket.hits.length >= this.limit) {
      const oldest = bucket.hits[0] ?? time;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + this.windowMs - time) / 1000),
      );
      this.buckets.set(key, bucket);
      return { ok: false, remaining: 0, retryAfterSeconds };
    }

    bucket.hits.push(time);
    this.buckets.set(key, bucket);
    this.evictIfNeeded();
    return {
      ok: true,
      remaining: this.limit - bucket.hits.length,
      retryAfterSeconds: 0,
    };
  }

  private evictIfNeeded() {
    if (this.buckets.size <= this.maxKeys) return;
    const cutoff = this.now() - this.windowMs;
    for (const [key, bucket] of this.buckets) {
      if ((bucket.hits[bucket.hits.length - 1] ?? 0) <= cutoff) {
        this.buckets.delete(key);
      }
      if (this.buckets.size <= this.maxKeys) return;
    }
    const oldest = this.buckets.keys().next();
    if (!oldest.done) this.buckets.delete(oldest.value);
  }
}

export const perMinuteLimiter = new SlidingWindowLimiter({
  limit: 10,
  windowMs: 60_000,
});

export const perHourLimiter = new SlidingWindowLimiter({
  limit: 40,
  windowMs: 60 * 60_000,
});

export const globalLimiter = new SlidingWindowLimiter({
  limit: 300,
  windowMs: 60 * 60_000,
});

export interface LimitCheck {
  ok: boolean;
  retryAfterSeconds: number;
}

export function checkAllLimits(ipKey: string): LimitCheck {
  const global = globalLimiter.check("global");
  if (!global.ok) {
    return { ok: false, retryAfterSeconds: global.retryAfterSeconds };
  }
  const perMinute = perMinuteLimiter.check(ipKey);
  if (!perMinute.ok) {
    return { ok: false, retryAfterSeconds: perMinute.retryAfterSeconds };
  }
  const perHour = perHourLimiter.check(ipKey);
  if (!perHour.ok) {
    return { ok: false, retryAfterSeconds: perHour.retryAfterSeconds };
  }
  return { ok: true, retryAfterSeconds: 0 };
}
