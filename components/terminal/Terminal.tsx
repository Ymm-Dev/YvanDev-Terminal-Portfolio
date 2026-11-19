"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CommandChips } from "@/components/terminal/CommandChips";
import { CommandInput } from "@/components/terminal/CommandInput";
import { Scrollback } from "@/components/terminal/Scrollback";
import { TitleBar } from "@/components/terminal/TitleBar";
import { TerminalContext, type TwinInfo } from "@/components/terminal/context";
import { panelDomId } from "@/components/terminal/PanelRenderer";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import { OFFLINE_MESSAGE } from "@/lib/ai/offline";
import { buildChatPayload } from "@/lib/terminal/chat-payload";
import { runCommand } from "@/lib/terminal/execute";
import { initialState, terminalReducer } from "@/lib/terminal/reducer";
import { panelLabel, panelToHash, parseRoute } from "@/lib/terminal/routing";
import { complete, ghostSuggestion } from "@/lib/terminal/suggestions";
import {
  bootTextEntry,
  panelEntry,
  type Entry,
  type PanelRef,
} from "@/lib/terminal/types";

function bootLines(): Entry[] {
  return [
    bootTextEntry(`${site.shell.user}@${site.shell.host}:~$ ./init --profile=yvan`, "muted"),
    bootTextEntry("[ ok ] profile loaded", "ok"),
    bootTextEntry(`[ ok ] mounted ${profile.projects.length} projects`, "ok"),
    bootTextEntry(`[ ok ] mounted ${profile.experience.length} roles`, "ok"),
    bootTextEntry(
      `[ ok ] mounted ${profile.education.length} education record${profile.education.length === 1 ? "" : "s"}`,
      "ok",
    ),
    bootTextEntry("[ ok ] shell ready — type 'help' or tap a shortcut below", "ok"),
  ];
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

export function Terminal() {
  const [state, dispatch] = useReducer(terminalReducer, initialState);
  const [input, setInput] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [twin, setTwin] = useState<TwinInfo>({ status: "checking" });
  const [booting, setBooting] = useState(true);
  const [stick, setStick] = useState(true);
  const [showJump, setShowJump] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const draft = useRef("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const stateRef = useRef(state);
  const bootFinished = useRef(false);
  const skipRef = useRef<(() => void) | null>(null);
  // Programmatic scrolls must not be mistaken for the visitor scrolling near
  // the bottom, or the auto-follow effect would immediately undo them.
  const suppressStick = useRef(false);

  // Keep event handlers on the latest state without re-creating them on every
  // keystroke. Updating in an effect (not during render) satisfies the refs
  // lint rule and is still current by the time any handler runs.
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const focusInput = useCallback(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const revealPanel = useCallback((panel: PanelRef, delay = 60) => {
    suppressStick.current = true;
    window.setTimeout(() => {
      document
        .getElementById(panelDomId(panel))
        ?.scrollIntoView({
          block: "start",
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      // Smooth scrolling settles well under this; the window is only here to
      // ignore the intermediate scroll events.
      window.setTimeout(() => {
        suppressStick.current = false;
      }, 700);
    }, delay);
  }, []);

  const skipBoot = useCallback(() => skipRef.current?.(), []);

  /* ------------------------------ health ------------------------------ */

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat/health", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { configured?: boolean; provider?: string; model?: string | null }) => {
        if (cancelled) return;
        setTwin(
          data.configured
            ? { status: "online", provider: data.provider, model: data.model ?? null }
            : { status: "offline", provider: data.provider ?? "offline", model: null },
        );
      })
      .catch(() => {
        if (!cancelled) setTwin({ status: "offline" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------- boot ------------------------------- */

  useEffect(() => {
    if (bootFinished.current) return;

    const controller = new AbortController();
    const timers: number[] = [];
    let index = 0;
    const lines = bootLines();

    const cleanup = () => {
      controller.abort();
      for (const id of timers) window.clearTimeout(id);
      timers.length = 0;
      skipRef.current = null;
    };

    const focusSoon = () => {
      window.setTimeout(() => focusInput(), 80);
    };

    function completeBoot(extra: Entry[], routeHash: string) {
      if (bootFinished.current) return;
      bootFinished.current = true;
      cleanup();

      if (extra.length) dispatch({ type: "apply", entries: extra });
      dispatch({ type: "booted" });
      setBooting(false);

      const routed = routeHash ? parseRoute(routeHash) : null;
      const landing: PanelRef = routed ?? { type: "welcome" };
      dispatch({ type: "apply", entries: [panelEntry(landing)] });
      if (routed) {
        window.history.replaceState(null, "", panelToHash(routed));
        setAnnouncement(`${panelLabel(routed)} opened.`);
      }
      setStick(false);
      revealPanel(landing, 120);
      focusSoon();
    }

    function tick() {
      if (bootFinished.current) return;
      if (index >= lines.length) {
        completeBoot([], "");
        return;
      }
      const line = lines[index];
      index += 1;
      if (line) dispatch({ type: "apply", entries: [line] });

      if (index >= lines.length) {
        timers.push(window.setTimeout(() => completeBoot([], ""), 120));
        return;
      }
      timers.push(window.setTimeout(tick, 80));
    }

    function skip() {
      if (bootFinished.current) return;
      completeBoot(lines.slice(index), "");
    }

    // Remove any boot lines left by an interrupted Strict Mode or Fast
    // Refresh mount before replaying the sequence.
    dispatch({ type: "boot/reset" });
    skipRef.current = skip;

    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);

    if (hash) {
      completeBoot([], hash);
      return cleanup;
    }

    if (prefersReducedMotion() || params.get("noBoot") === "1") {
      completeBoot([], "");
      return cleanup;
    }

    window.addEventListener("keydown", skip, { signal: controller.signal });
    window.addEventListener("pointerdown", skip, { signal: controller.signal });
    timers.push(window.setTimeout(tick, 80));

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------- deep links ---------------------------- */

  useEffect(() => {
    function onHashChange() {
      if (!bootFinished.current) return;
      const panel = parseRoute(window.location.hash);
      if (!panel) return;
      dispatch({ type: "apply", entries: [panelEntry(panel)] });
      setAnnouncement(`${panelLabel(panel)} opened.`);
      setStick(false);
      setShowJump(false);
      revealPanel(panel);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [revealPanel]);

  /* ---------------------------- scrolling ----------------------------- */

  useEffect(() => {
    if (!stick || suppressStick.current) return;
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [state.entries.length, state.chat.messages, stick]);

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (suppressStick.current) return;
    const element = event.currentTarget;
    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    setStick(distance < 90);
    setShowJump(distance > 160);
  }, []);

  const jumpToLatest = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    suppressStick.current = false;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    setStick(true);
    setShowJump(false);
  }, []);

  /* ----------------------------- commands ----------------------------- */

  const openPanel = useCallback((panel: PanelRef) => {
    dispatch({ type: "apply", entries: [panelEntry(panel)] });
    if (stateRef.current.mode === "chat") {
      dispatch({ type: "mode", mode: "shell" });
    }
    window.history.replaceState(null, "", panelToHash(panel));
    setAnnouncement(`${panelLabel(panel)} opened.`);
    setInput("");
    setHistoryIndex(null);
    setStick(false);
    setShowJump(false);
    revealPanel(panel);
  }, [revealPanel]);

  const run = useCallback(
    (command: string) => {
      const text = command.trim();
      if (!text) return;

      dispatch({ type: "submit", input: text });
      const result = runCommand(text, { history: stateRef.current.history });

      if (result.clear) dispatch({ type: "clear" });
      if (result.entries.length) {
        dispatch({ type: "apply", entries: result.entries });
      }
      if (result.mode) dispatch({ type: "mode", mode: result.mode });

      if (result.clear) {
        window.history.replaceState(null, "", "/");
      } else if (result.hash) {
        window.history.replaceState(null, "", result.hash);
      }

      if (result.download) {
        triggerDownload(result.download, site.resumeFileName);
      }
      if (result.announce) setAnnouncement(result.announce);

      const resultPanel = result.entries.find((entry) => entry.kind === "panel");
      if (resultPanel && resultPanel.kind === "panel") {
        // Rich output grows downward; showing its header matters more than
        // pinning the newest line to the bottom.
        setStick(false);
        setShowJump(false);
        revealPanel(resultPanel.panel);
      } else {
        setStick(true);
        setShowJump(false);
      }

      setInput("");
      setHistoryIndex(null);
      draft.current = "";
      window.setTimeout(() => focusInput(), 0);
    },
    [focusInput, revealPanel],
  );

  /* ------------------------------- chat ------------------------------- */

  const send = useCallback(async (message: string) => {
    const text = message.trim();
    if (!text) return;
    if (stateRef.current.chat.status === "streaming") return;

    const payload = buildChatPayload(stateRef.current.chat.messages, text);

    dispatch({ type: "chat/user", text });
    dispatch({ type: "chat/start" });
    dispatch({ type: "chat/status", status: "streaming" });
    setStick(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (response.status === 503) {
        dispatch({ type: "chat/chunk", text: OFFLINE_MESSAGE });
        dispatch({ type: "chat/status", status: "offline" });
        setTwin({ status: "offline" });
        return;
      }
      if (response.status === 429) {
        dispatch({
          type: "chat/fail",
          error:
            "The twin is rate-limited right now. Give it a minute, or use `contact` to reach Yvan directly.",
        });
        return;
      }
      if (response.status === 400) {
        dispatch({
          type: "chat/fail",
          error:
            "That conversation is too long for the twin. Reset the chat and ask again, or use `contact` to reach Yvan directly.",
        });
        return;
      }
      if (!response.ok || !response.body) {
        throw new Error("bad response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        dispatch({ type: "chat/chunk", text: decoder.decode(value, { stream: true }) });
      }
      dispatch({ type: "chat/status", status: "idle" });
      setAnnouncement("AI replied.");
    } catch {
      dispatch({
        type: "chat/fail",
        error:
          "The connection dropped before the twin finished. Try again, or use `contact` to reach Yvan directly.",
      });
    }
  }, []);

  const resetChat = useCallback(() => {
    dispatch({ type: "chat/reset" });
    setAnnouncement("Conversation cleared.");
  }, []);

  const submit = useCallback(() => {
    if (stateRef.current.mode === "chat") {
      const text = input;
      setInput("");
      void send(text);
      return;
    }
    run(input);
  }, [input, run, send]);

  const cycleHistory = useCallback(
    (direction: -1 | 1) => {
      const history = stateRef.current.history;
      if (history.length === 0) return;

      if (historyIndex === null) {
        if (direction === 1) return;
        draft.current = input;
        const next = history.length - 1;
        setHistoryIndex(next);
        setInput(history[next] ?? "");
        return;
      }

      const next = historyIndex + direction;
      if (next < 0) {
        setHistoryIndex(0);
        setInput(history[0] ?? "");
        return;
      }
      if (next >= history.length) {
        setHistoryIndex(null);
        setInput(draft.current);
        return;
      }
      setHistoryIndex(next);
      setInput(history[next] ?? "");
    },
    [historyIndex, input],
  );

  const completeInput = useCallback(() => {
    const result = complete(input);
    if (result.value !== input) setInput(result.value);
  }, [input]);

  const clearInput = useCallback(() => {
    setInput("");
    setHistoryIndex(null);
    draft.current = "";
  }, []);

  const exitMode = useCallback(() => {
    if (stateRef.current.mode === "chat") {
      dispatch({ type: "mode", mode: "shell" });
      setAnnouncement("Chat mode closed. Terminal input restored.");
      return;
    }
    inputRef.current?.blur();
  }, []);

  /* ------------------------------- misc ------------------------------- */

  const ghost = useMemo(
    () => (state.mode === "shell" ? ghostSuggestion(input) : ""),
    [input, state.mode],
  );

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${viewport.height}px`,
      );
    };
    update();
    viewport.addEventListener("resize", update);
    return () => viewport.removeEventListener("resize", update);
  }, []);

  const api = useMemo(
    () => ({
      run,
      openPanel,
      send: (message: string) => void send(message),
      resetChat,
      chat: state.chat,
      twin,
      chatMode: state.mode === "chat",
    }),
    [run, openPanel, send, resetChat, state.chat, twin, state.mode],
  );

  function handleBackgroundClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a,button,input,textarea,select,[role='button']")) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <TerminalContext.Provider value={api}>
      <div className="flex min-h-dvh w-full flex-col items-center md:px-6 md:py-[9vh]">
        <div className="terminal-shell window flex w-full max-w-[1180px] flex-col overflow-hidden border-line bg-surface md:rounded-md md:border">
          <TitleBar
            twin={twin}
            onRecruiter={() => run("recruiter")}
            onChat={() => run("chat")}
          />

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col" onClick={handleBackgroundClick}>
              <Scrollback
                entries={state.entries}
                containerRef={scrollRef}
                onScroll={onScroll}
              />
            </div>

            {showJump ? (
              <button
                type="button"
                onClick={jumpToLatest}
                className="absolute bottom-3 right-3 z-10 rounded-full border border-line-bright bg-surface-2/95 px-3 py-1.5 text-[11.5px] text-muted shadow-lg backdrop-blur hover:text-ink"
              >
                ↓ jump to latest
              </button>
            ) : null}
          </div>

          <CommandChips onRun={run} />

          <div className="shrink-0 border-t border-line bg-surface-2/50 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2">
            <CommandInput
              value={input}
              onChange={setInput}
              onSubmit={submit}
              onHistory={cycleHistory}
              onComplete={completeInput}
              onClear={clearInput}
              onExit={exitMode}
              mode={state.mode}
              ghost={ghost}
              inputRef={inputRef}
              maxLength={state.mode === "chat" ? site.maxChatChars : undefined}
            />
            <div
              className={`mt-1.5 flex min-h-5 items-center gap-3 text-[10.5px] text-faint ${
                booting ? "" : "hidden sm:flex"
              }`}
            >
              <p id="terminal-hint" className="hidden sm:block">
                ↑↓ history · tab complete · ctrl+l clear · esc{" "}
                {state.mode === "chat" ? "leave chat" : "blur"}
                {booting ? " · booting…" : ""}
              </p>
              {booting ? (
                <button
                  type="button"
                  onClick={skipBoot}
                  className="text-green underline decoration-dotted underline-offset-4 hover:text-ink"
                >
                  skip intro →
                </button>
              ) : null}
            </div>
          </div>

          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>
      </div>
    </TerminalContext.Provider>
  );
}
