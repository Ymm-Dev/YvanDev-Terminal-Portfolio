"use client";

import { useTerminal } from "@/components/terminal/context";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { commands, helpGroups } from "@/lib/terminal/commands";

const groupCopy: Record<(typeof helpGroups)[number], string> = {
  portfolio: "portfolio",
  system: "shell",
  ai: "ai",
  fun: "fun",
};

export function HelpPanel({ id }: { id?: string }) {
  const { run } = useTerminal();

  return (
    <PanelFrame
      id={id}
      label="help"
      meta={`${commands.length} commands`}
      footer={<span>usage: command [arg] · every row is clickable</span>}
    >
      <div className="space-y-5">
        {helpGroups.map((group) => {
          const groupCommands = commands.filter(
            (command) => command.category === group,
          );
          if (groupCommands.length === 0) return null;
          return (
            <div key={group}>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-faint">
                {groupCopy[group]}
              </p>
              <ul className="space-y-1">
                {groupCommands.map((command) => (
                  <li
                    key={command.name}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded px-1 py-1 hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <code className="text-[12.5px] text-green">
                          {command.usage}
                        </code>
                        <span className="text-[12.5px] text-muted">
                          {command.summary}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => run(command.name)}
                      className="chip hover:text-ink"
                      aria-label={`Run ${command.name}`}
                    >
                      run
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </PanelFrame>
  );
}
