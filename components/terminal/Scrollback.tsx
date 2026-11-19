"use client";

import type { RefObject } from "react";
import { PanelRenderer } from "@/components/terminal/PanelRenderer";
import { site } from "@/data/site";
import type { Entry } from "@/lib/terminal/types";

const toneClass: Record<string, string> = {
  default: "text-ink",
  muted: "text-muted",
  ok: "text-green",
  warn: "text-amber",
  error: "text-red",
  accent: "text-cyan",
};

function EntryView({ entry }: { entry: Entry }) {
  switch (entry.kind) {
    case "input":
      return (
        <p className="flex flex-wrap gap-x-2 text-[13px] leading-6">
          <span className="shrink-0 text-green">
            {site.shell.user}@{site.shell.host}:~$
          </span>
          <span className="break-all text-ink">{entry.text}</span>
        </p>
      );
    case "text":
      return (
        <p
          className={`whitespace-pre-wrap break-words text-[13px] leading-6 ${
            toneClass[entry.tone ?? "default"] ?? "text-ink"
          } ${entry.boot ? "boot-line" : ""}`}
        >
          {entry.text}
        </p>
      );
    case "notice":
      return (
        <p className={`text-[12.5px] ${toneClass[entry.tone ?? "muted"]}`}>
          {entry.text}
        </p>
      );
    case "panel":
      return <PanelRenderer panel={entry.panel} />;
    default:
      return null;
  }
}

export function Scrollback({
  entries,
  containerRef,
  onScroll,
}: {
  entries: Entry[];
  containerRef: RefObject<HTMLDivElement | null>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      role="log"
      aria-label="Terminal output"
      aria-live="off"
      className="scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4"
    >
      <div className="mx-auto max-w-[1000px]">
        {entries.map((entry) => (
          <EntryView key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
