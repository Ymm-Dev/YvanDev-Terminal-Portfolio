"use client";

const chips = [
  { command: "recruiter", label: "recruiter" },
  { command: "projects", label: "projects" },
  { command: "skills", label: "skills" },
  { command: "experience", label: "experience" },
  { command: "contact", label: "contact" },
  { command: "chat", label: "ai twin" },
  { command: "help", label: "help" },
];

export function CommandChips({ onRun }: { onRun: (command: string) => void }) {
  return (
    <div className="shrink-0 border-t border-line bg-surface/60 px-3 py-2">
      <div
        className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Command shortcuts"
      >
        {chips.map((chip) => (
          <button
            key={chip.command}
            type="button"
            onClick={() => onRun(chip.command)}
            className={`chip chip-lg shrink-0 hover:text-ink ${
              chip.command === "chat" ? "text-purple/90 hover:text-purple" : ""
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
