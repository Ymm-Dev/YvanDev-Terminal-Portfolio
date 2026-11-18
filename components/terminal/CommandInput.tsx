"use client";

import { useState, type RefObject } from "react";
import { site } from "@/data/site";

export function CommandInput({
  value,
  onChange,
  onSubmit,
  onHistory,
  onComplete,
  onClear,
  onExit,
  mode,
  ghost,
  busy,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistory: (direction: -1 | 1) => void;
  onComplete: () => void;
  onClear: () => void;
  onExit: () => void;
  mode: "shell" | "chat";
  ghost: string;
  busy?: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const [caretAtEnd, setCaretAtEnd] = useState(true);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      onComplete();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      onHistory(-1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onHistory(1);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onExit();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
      event.preventDefault();
      onClear();
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      onClear();
    }
  }

  function updateCaret() {
    const element = inputRef.current;
    if (!element) return;
    setCaretAtEnd(
      element.selectionStart === value.length &&
        element.selectionEnd === value.length,
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2"
    >
      <label htmlFor="terminal-input" className="sr-only">
        Terminal command input
      </label>

      <span
        aria-hidden
        className={`shrink-0 select-none text-[12.5px] ${
          mode === "chat" ? "text-purple" : "text-green"
        }`}
      >
        {mode === "chat" ? (
          <>
            talk <span className="text-faint">▸</span>
          </>
        ) : (
          <>
            {site.shell.user}@{site.shell.host}
            <span className="text-faint">:~$</span>
          </>
        )}
      </span>

      <div className="relative min-w-0 flex-1">
        {ghost && caretAtEnd && mode === "shell" ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 truncate whitespace-pre text-[16px] leading-8 text-transparent sm:text-[14px]"
          >
            {value}
            <span className="text-faint/70">{ghost}</span>
          </span>
        ) : null}
        <input
          ref={inputRef}
          id="terminal-input"
          name="command"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            requestAnimationFrame(updateCaret);
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCaret}
          onClick={updateCaret}
          onSelect={updateCaret}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint={mode === "chat" ? "send" : "go"}
          inputMode="text"
          aria-describedby="terminal-hint"
          disabled={busy}
          placeholder={
            mode === "chat"
              ? "ask about my work, skills or experience"
              : "type a command — try help, or tap a shortcut"
          }
          className="w-full bg-transparent text-[16px] leading-8 text-ink caret-green outline-none placeholder:text-faint/70 disabled:opacity-60 sm:text-[14px]"
        />
      </div>

      <button
        type="submit"
        className="chip chip-lg shrink-0 hover:text-ink"
        disabled={busy}
        aria-label={mode === "chat" ? "Send message" : "Run command"}
      >
        {mode === "chat" ? "send" : "run"}
      </button>
    </form>
  );
}
