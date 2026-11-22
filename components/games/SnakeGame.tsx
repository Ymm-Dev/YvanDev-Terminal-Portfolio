"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DirectionPad } from "@/components/games/DirectionPad";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { directionFromKey } from "@/lib/games/direction";
import {
  createSnake,
  pauseSnake,
  resumeSnake,
  startSnake,
  stepSnake,
  turnSnake,
  type SnakeState,
} from "@/lib/games/snake";
import { readBestScore, saveBestScore } from "@/lib/games/storage";

const STATUS_TEXT: Record<SnakeState["status"], string> = {
  idle: "ready",
  running: "running",
  paused: "paused",
  over: "game over",
};

export function SnakeGame({ id }: { id?: string }) {
  const [state, setState] = useState<SnakeState>(() => createSnake());
  const [best, setBest] = useState(() => readBestScore("snake"));
  const boardRef = useRef<HTMLDivElement>(null);
  const bestRef = useRef(best);
  const hintId = useId();

  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  const interval = Math.max(70, 160 - Math.floor(state.score / 50) * 10);

  useEffect(() => {
    if (state.status !== "running") return;
    const timer = window.setInterval(() => {
      setState((current) => stepSnake(current));
    }, interval);
    return () => window.clearInterval(timer);
  }, [state.status, interval]);

  useEffect(() => {
    if (state.score <= bestRef.current) return;
    bestRef.current = state.score;
    setBest(saveBestScore("snake", state.score));
  }, [state.score]);

  useEffect(() => {
    const pause = () => setState((current) => pauseSnake(current));
    const onVisibility = () => {
      if (document.visibilityState === "hidden") pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const restart = () => {
    setState(startSnake(createSnake()));
    boardRef.current?.focus();
  };

  const toggle = () => {
    setState((current) => {
      if (current.status === "idle") return startSnake(current);
      if (current.status === "running") return pauseSnake(current);
      if (current.status === "paused") return resumeSnake(current);
      return startSnake(createSnake());
    });
    boardRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const direction = directionFromKey(event.key);
    if (direction) {
      event.preventDefault();
      setState((current) => turnSnake(current, direction));
      return;
    }

    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      toggle();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setState((current) => pauseSnake(current));
      boardRef.current?.blur();
      document.getElementById("terminal-input")?.focus();
    }
  };

  const snakeCells = new Map(
    state.snake.map((segment, index) => [`${segment.x},${segment.y}`, index]),
  );
  const cells: React.ReactNode[] = [];

  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      const index = snakeCells.get(`${x},${y}`);
      const food =
        state.food !== null && state.food.x === x && state.food.y === y;
      const tone =
        index === 0
          ? "rounded-[2px] bg-green"
          : index !== undefined
            ? "rounded-[1px] bg-green/50"
            : food
              ? "rounded-full bg-red"
              : "";

      cells.push(
        <div
          key={`${x}-${y}`}
          aria-hidden
          className={`aspect-square ${tone}`}
        />,
      );
    }
  }

  const primaryLabel =
    state.status === "running"
      ? "Pause"
      : state.status === "paused"
        ? "Resume"
        : state.status === "over"
          ? "Play again"
          : "Start";

  const baseAnnouncement =
    state.status === "over"
      ? `Game over. Score ${state.score}. Restart to play again.`
      : state.status === "paused"
        ? "Snake paused."
        : state.status === "running"
          ? `Snake running. Score ${state.score}.`
          : "Snake ready. Press Start, then steer with arrow keys or WASD.";
  const announcement =
    state.status !== "over" && state.score > 0 && state.score >= best
      ? `${baseAnnouncement} New best score: ${best}.`
      : baseAnnouncement;

  return (
    <PanelFrame
      id={id}
      label="snake"
      meta={`${state.score} pts`}
      footer={<span>arrows / WASD steer · space pauses · esc leaves the board</span>}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
          <span className="text-ink" data-testid="snake-score">
            score {state.score}
          </span>
          <span className="text-faint">best {best}</span>
          <span className="text-muted" data-testid="snake-status">
            {STATUS_TEXT[state.status]}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div
            ref={boardRef}
            role="group"
            aria-label="Snake board"
            aria-describedby={hintId}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="grid w-full max-w-[560px] gap-px rounded border border-line bg-bg p-1 outline-none focus-visible:ring-2 focus-visible:ring-green/60"
            style={{
              gridTemplateColumns: `repeat(${state.cols}, minmax(0, 1fr))`,
            }}
          >
            {cells}
          </div>

          <div className="flex flex-col items-start gap-2">
            <DirectionPad
              onDirection={(direction) =>
                setState((current) => turnSnake(current, direction))
              }
              disabled={state.status !== "running"}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggle}
                className="min-h-9 rounded border border-line bg-surface-2 px-3 text-[12px] text-ink transition-colors hover:border-line-bright"
              >
                {primaryLabel}
              </button>
              <button
                type="button"
                onClick={restart}
                className="min-h-9 rounded border border-line px-3 text-[12px] text-muted transition-colors hover:border-line-bright hover:text-ink"
              >
                Restart
              </button>
            </div>
          </div>
        </div>

        <p id={hintId} className="text-[11px] text-faint">
          Use arrow keys or WASD while the board is focused. Space pauses and
          Escape returns to the prompt.
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </PanelFrame>
  );
}
