"use client";

import { useTerminal } from "@/components/terminal/context";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { profile } from "@/data/profile";
import { OFFLINE_MESSAGE } from "@/lib/ai/offline";

const starters = [
  "Tell me about yourself.",
  "What technologies do you work with?",
  "What was your role at Thurston?",
  "Are you open to new opportunities?",
];

export function ChatPanel({ id }: { id?: string }) {
  const { chat, send, resetChat, twin } = useTerminal();
  const streaming = chat.status === "streaming";
  const offline = chat.status === "offline" || twin.status === "offline";

  return (
    <PanelFrame
      id={id}
      label="ai twin"
      meta={
        streaming
          ? "typing…"
          : twin.status === "online"
            ? "online"
            : twin.status === "checking"
              ? "checking"
              : "offline"
      }
      tone="ai"
      footer={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>esc leaves chat mode</span>
          <span>·</span>
          <span>answers come only from the profile above</span>
          {chat.messages.length > 0 ? (
            <button
              type="button"
              onClick={resetChat}
              className="ml-auto text-muted underline decoration-dotted underline-offset-4 hover:text-ink"
            >
              reset
            </button>
          ) : null}
        </span>
      }
    >
      <div className="space-y-4">
        <div className="border-l-2 border-purple/40 pl-3">
          <p className="text-[12.5px] text-muted">
            I&apos;m the AI twin of {profile.name.split(" ")[0]} — an AI stand-in,
            not the real person. I answer from his portfolio data and will say so
            when I don&apos;t know.
          </p>
        </div>

        {offline && chat.messages.length === 0 ? (
          <div className="rounded border border-amber/30 bg-amber/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-amber">
              ai-twin: offline
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] text-muted">
              {OFFLINE_MESSAGE}
            </p>
            <a
              href={`mailto:${profile.contact.email}`}
              className="mt-2 inline-block text-[12.5px] text-cyan"
            >
              {profile.contact.email} ↗
            </a>
          </div>
        ) : null}

        {chat.messages.length === 0 ? (
          <div>
            <p className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-faint">
              try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {starters.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => send(question)}
                  className="chip chip-lg text-left hover:text-purple"
                  disabled={offline}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3" role="log" aria-label="Conversation with the AI twin">
          {chat.messages.map((message, index) => {
            const isLast = index === chat.messages.length - 1;
            const isUser = message.role === "user";
            return (
              <div key={message.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
                <span
                  className={`select-none pt-0.5 text-[12px] ${
                    isUser ? "text-cyan" : "text-purple"
                  }`}
                >
                  {isUser ? "you ▸" : "yvan-ai ▸"}
                </span>
                <div className="min-w-0">
                  <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-ink">
                    {message.text}
                    {!isUser && isLast && streaming ? (
                      <span className="cursor ml-0.5 align-baseline" aria-hidden />
                    ) : null}
                  </p>
                  {!isUser && isLast && streaming && !message.text ? (
                    <p className="text-[12px] text-faint">thinking…</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {chat.status === "error" && chat.error ? (
          <div className="rounded border border-red/30 bg-red/5 p-2.5">
            <p className="text-[12.5px] text-red">{chat.error}</p>
          </div>
        ) : null}

        <p aria-live="polite" className="sr-only">
          {streaming ? "AI is typing" : chat.status === "idle" && chat.messages.length ? "AI replied" : ""}
        </p>

        {chat.messages.length === 0 && !offline ? (
          <p className="text-[11.5px] text-faint">
            type below and press enter — the prompt switches to <code>talk ▸</code>
          </p>
        ) : null}
      </div>
    </PanelFrame>
  );
}
