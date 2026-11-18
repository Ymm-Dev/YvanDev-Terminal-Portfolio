"use client";

import { PanelFrame } from "@/components/ui/PanelFrame";
import { useTerminal } from "@/components/terminal/context";
import { profile } from "@/data/profile";

const quick = [
  { command: "recruiter", label: "Recruiter brief", hint: "40-second version" },
  { command: "projects", label: "Projects", hint: "3 featured builds" },
  { command: "skills", label: "Skills", hint: "by category" },
  { command: "experience", label: "Experience", hint: "2 roles" },
  { command: "chat", label: "AI twin", hint: "ask me anything" },
  { command: "resume", label: "Resume", hint: "PDF download" },
];

export function WelcomePanel({ id }: { id?: string }) {
  const { run } = useTerminal();

  return (
    <PanelFrame
      id={id}
      label="welcome"
      meta="session ready"
      tone="accent"
      footer={
        <span>
          <span className="text-ink">help</span> for every command ·{" "}
          <span className="text-ink">↑ ↓</span> history ·{" "}
          <span className="text-ink">tab</span> completes
        </span>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-faint">
            yvan@portfolio
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {profile.name}
          </h2>
          <p className="mt-0.5 text-[13.5px] text-green">{profile.title}</p>
        </div>

        <p className="prose-terminal max-w-[62ch]">{profile.summary}</p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quick.map((item) => (
            <button
              key={item.command}
              type="button"
              onClick={() => run(item.command)}
              className="group flex min-h-14 flex-col items-start justify-center rounded border border-line bg-bg/40 px-3 py-2 text-left transition-colors hover:border-line-bright hover:bg-surface-2 focus-visible:border-green"
            >
              <span className="text-[13px] text-ink group-hover:text-green">
                {item.label}
              </span>
              <span className="text-[11px] text-faint">{item.hint}</span>
            </button>
          ))}
        </div>

        <p className="text-[11.5px] text-faint">
          No typing required — every command below the prompt is clickable.
        </p>
      </div>
    </PanelFrame>
  );
}
