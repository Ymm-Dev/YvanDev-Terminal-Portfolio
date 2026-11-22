"use client";

import { PanelFrame } from "@/components/ui/PanelFrame";
import { useTerminal } from "@/components/terminal/context";
import { useTheme } from "@/components/theme/useTheme";
import { THEMES, themeLabel } from "@/lib/theme";

export function ThemePanel({ id }: { id?: string }) {
  const { run } = useTerminal();
  const current = useTheme();

  return (
    <PanelFrame
      id={id}
      label="theme"
      meta={`current: ${themeLabel(current).toLowerCase()}`}
      footer={
        <span>
          theme &lt;name&gt; · saved in this browser · no flash on reload
        </span>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const active = theme.name === current;
          return (
            <button
              key={theme.name}
              type="button"
              data-theme={theme.name}
              aria-pressed={active}
              onClick={() => run(`theme ${theme.name}`)}
              className={`group flex flex-col gap-2 rounded border bg-surface p-3 text-left transition-colors hover:border-line-bright focus-visible:border-green ${
                active ? "border-green" : "border-line"
              }`}
            >
              <span
                aria-hidden
                className="flex items-center justify-between gap-3 rounded-sm border border-line bg-bg px-2.5 py-2"
              >
                <span className="text-[11px] tracking-tight">
                  <span className="text-green">yvan@portfolio</span>
                  <span className="text-faint">:~$</span>
                  <span className="ml-1.5 text-muted">theme</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <span className="size-2 rounded-full bg-green" />
                  <span className="size-2 rounded-full bg-cyan" />
                  <span className="size-2 rounded-full bg-amber" />
                </span>
              </span>

              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-ink group-hover:text-green">
                  {theme.label}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.16em] ${
                    active ? "text-green" : "text-faint"
                  }`}
                >
                  {active ? "current" : theme.scheme}
                </span>
              </span>
              <span className="text-[11px] text-faint">{theme.summary}</span>
            </button>
          );
        })}
      </div>
    </PanelFrame>
  );
}
