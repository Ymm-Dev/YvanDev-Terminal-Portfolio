import type { TwinInfo } from "@/components/terminal/context";

const copy: Record<TwinInfo["status"], { text: string; dot: string; tone: string }> = {
  checking: { text: "ai-twin: checking", dot: "bg-faint", tone: "text-faint" },
  online: { text: "ai-twin: online", dot: "bg-purple", tone: "text-purple" },
  offline: { text: "ai-twin: offline", dot: "bg-amber", tone: "text-amber" },
};

export function TwinBadge({
  twin,
  onClick,
}: {
  twin: TwinInfo;
  onClick?: () => void;
}) {
  const state = copy[twin.status];
  const content = (
    <>
      <span aria-hidden className={`size-1.5 rounded-full ${state.dot}`} />
      <span className="hidden sm:inline">{state.text}</span>
      <span className="sm:hidden">ai</span>
    </>
  );

  if (!onClick) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] ${state.tone}`}
        title={state.text}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded border border-line px-2 text-[11px] hover:border-line-bright ${state.tone}`}
      title={`${state.text} — open the AI twin`}
    >
      {content}
    </button>
  );
}
