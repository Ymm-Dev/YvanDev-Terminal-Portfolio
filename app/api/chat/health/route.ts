import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/provider";

export const runtime = "nodejs";

/**
 * Public health probe for the title-bar badge. Returns no key material, no
 * quotas, and no upstream identifiers beyond the provider name.
 */
export async function GET() {
  const provider = getProvider();
  return NextResponse.json(
    {
      ok: provider.configured,
      provider: provider.id,
      model: provider.configured ? provider.model ?? null : null,
      configured: provider.configured,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
