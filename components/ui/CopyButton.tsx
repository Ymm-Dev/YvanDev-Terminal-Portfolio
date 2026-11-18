"use client";

import { useRef, useState } from "react";

export function CopyButton({
  value,
  label,
  compact = false,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`chip ${compact ? "" : "chip-lg"} hover:text-ink`}
      aria-label={`Copy ${label}`}
    >
      <span aria-hidden className="text-faint">
        ⧉
      </span>
      <span aria-live="polite">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
