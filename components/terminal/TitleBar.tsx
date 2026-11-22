"use client";

import { TwinBadge } from "@/components/ui/TwinBadge";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { useTheme } from "@/components/theme/useTheme";
import { themeLabel } from "@/lib/theme";
import type { TwinInfo } from "@/components/terminal/context";

export function TitleBar({
  twin,
  onRecruiter,
  onChat,
  onTheme,
}: {
  twin: TwinInfo;
  onRecruiter: () => void;
  onChat: () => void;
  onTheme: () => void;
}) {
  const theme = useTheme();
  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-surface-2/70 px-3">
      <div className="flex gap-1.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-red/80" />
        <span className="size-2.5 rounded-full bg-amber/80" />
        <span className="size-2.5 rounded-full bg-green/80" />
      </div>

      <p className="ml-1 truncate text-[11.5px] leading-none text-faint">
        <span className="text-muted">yvan@portfolio</span>
        <span className="mx-1">:</span>
        <span>~/portfolio</span>
      </p>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <AvailabilityBadge compact />
        <button
          type="button"
          onClick={onRecruiter}
          className="hidden min-h-8 items-center gap-1.5 rounded border border-line px-2 text-[11px] text-muted hover:border-line-bright hover:text-ink sm:inline-flex"
        >
          <span aria-hidden className="text-green">
            ▸
          </span>
          recruiter mode
        </button>
        <button
          type="button"
          onClick={onTheme}
          aria-label={`Change theme (current: ${themeLabel(theme)})`}
          className="inline-flex min-h-8 items-center gap-1.5 rounded border border-line px-2 text-[11px] text-muted hover:border-line-bright hover:text-ink"
        >
          <span aria-hidden className="text-cyan">
            ◐
          </span>
          <span className="hidden md:inline">{themeLabel(theme)}</span>
        </button>
        <TwinBadge twin={twin} onClick={onChat} />
      </div>
    </header>
  );
}
