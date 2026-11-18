import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { getProvider } from "@/lib/ai/provider";
import { checkAllLimits } from "@/lib/ai/rate-limit";
import { chatRequestSchema, normaliseMessages } from "@/lib/ai/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "local";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function errorPayload(status: number, error: string, retryAfter?: number) {
  return NextResponse.json(
    { error, ...(retryAfter ? { retryAfter } : {}) },
    {
      status,
      headers: retryAfter ? { "retry-after": String(retryAfter) } : undefined,
    },
  );
}

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { status?: unknown; code?: unknown };
  if (typeof candidate.status === "number") return candidate.status;
  if (candidate.code === 429) return 429;
  return undefined;
}

export async function POST(request: Request) {
  const limit = checkAllLimits(clientKey(request));
  if (!limit.ok) {
    return errorPayload(429, "rate_limited", limit.retryAfterSeconds);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorPayload(400, "invalid_request");
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorPayload(400, "invalid_request");
  }

  const provider = getProvider();
  if (!provider.configured) {
    return errorPayload(503, "offline");
  }

  const messages = normaliseMessages(parsed.data.messages);
  const system = buildSystemPrompt();

  let iterator: AsyncIterator<string>;
  let first: IteratorResult<string>;
  try {
    iterator = provider.stream({ messages, system })[Symbol.asyncIterator]();
    first = await iterator.next();
  } catch (error) {
    const status = statusOf(error);
    if (status === 429) return errorPayload(429, "rate_limited", 30);
    if (status === 401 || status === 403) return errorPayload(503, "misconfigured");
    return errorPayload(502, "upstream");
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done && first.value) controller.enqueue(encoder.encode(first.value));
        while (true) {
          const next = await iterator.next();
          if (next.done) break;
          if (next.value) controller.enqueue(encoder.encode(next.value));
        }
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(
            "\n\n[connection interrupted — try again, or use `contact` to reach Yvan directly.]",
          ),
        );
        controller.close();
      }
    },
    cancel() {
      void iterator.return?.();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-twin-provider": provider.id,
    },
  });
}
