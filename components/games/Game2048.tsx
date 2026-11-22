"use client";

import { useEffect, useRef, useState } from "react";
import { DirectionPad } from "@/components/games/DirectionPad";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { directionFromKey, type Direction } from "@/lib/games/direction";
import { create2048, move2048, type Board2048 } from "@/lib/games/game2048";
import { readBestScore, saveBestScore } from "@/lib/games/storage";

type Status = "playing" | "won" | "over";

interface GameState {
  board: Board2048;
  score: number;
  status: Status;
}

const STATUS_TEXT: Record<Status, string> = {
  playing: "playing",
  won: "won · keep going",
  over: "game over",
};

function tileTone(tile: number | null): string {
  if (tile === null) return "border-line bg-bg/40";
  if (tile >= 2048) return "border-amber/60 bg-amber/30 text-ink";
  if (tile >= 256) return "border-purple/40 bg-purple/25 text-ink";
  if (tile >= 32) return "border-green/50 bg-green/25 text-green";
  if (tile >= 8) return "border-cyan/40 bg-cyan/20 text-cyan";
  return "border-line bg-surface-2 text-ink";
}

export function Game2048({
  id,
  rng = Math.random,
}: {
  id?: string;
  rng?: () => number;
}) {
  const [game, setGame] = useState<GameState>(() => ({
    board: create2048(rng),
    score: 0,
    status: "playing",
  }));
  const [best, setBest] = useState(() => readBestScore("2048"));
  const boardRef = useRef<HTMLDivElement>(null);
  const bestRef = useRef(best);

  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  useEffect(() => {
    if (game.score <= bestRef.current) return;
    bestRef.current = game.score;
    setBest(saveBestScore("2048", game.score));
  }, [game.score]);

  const move = (direction: Direction) => {
    setGame((current) => {
      if (current.status === "over") return current;

      const result = move2048(current.board, direction, rng);
      if (!result.moved) return current;

      const status: Status = result.over
        ? "over"
        : result.won && current.status === "playing"
          ? "won"
          : current.status;

      return {
        board: result.board,
        score: current.score + result.gained,
        status,
      };
    });
  };

  const newGame = () => {
    setGame({
      board: create2048(rng),
      score: 0,
      status: "playing",
    });
    boardRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const direction = directionFromKey(event.key);
    if (direction) {
      event.preventDefault();
      move(direction);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      boardRef.current?.blur();
      document.getElementById("terminal-input")?.focus();
    }
  };

  const baseAnnouncement =
    game.status === "over"
      ? `Game over. Final score ${game.score}. Start a new game to play again.`
      : game.status === "won"
        ? `You reached 2048. Score ${game.score}. Keep going for a higher score.`
        : `2048 playing. Score ${game.score}.`;
  const announcement =
    game.status !== "over" && game.score > 0 && game.score >= best
      ? `${baseAnnouncement} New best score: ${best}.`
      : baseAnnouncement;

  return (
    <PanelFrame
      id={id}
      label="2048"
      meta={`${game.score} pts`}
      footer={<span>arrows / WASD slide · esc leaves the board · new game anytime</span>}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
        <div
          ref={boardRef}
          role="group"
          aria-label="2048 board"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="grid w-full max-w-[300px] grid-cols-4 gap-1 rounded border border-line bg-bg p-1 outline-none focus-visible:ring-2 focus-visible:ring-green/60"
        >
          {game.board.map((tile, index) => (
            <div
              key={index}
              aria-hidden
              className={`grid aspect-square place-items-center rounded border text-center font-medium ${
                tile !== null && tile >= 1024 ? "text-[15px]" : "text-lg"
              } ${tileTone(tile)}`}
            >
              {tile ?? ""}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
            <span className="text-ink" data-testid="2048-score">
              score {game.score}
            </span>
            <span className="text-faint">best {best}</span>
            <span className="text-muted" data-testid="2048-status">
              {STATUS_TEXT[game.status]}
            </span>
          </div>
          <DirectionPad
            onDirection={move}
            disabled={game.status === "over"}
          />
          <button
            type="button"
            onClick={newGame}
            className="min-h-9 rounded border border-line px-3 text-[12px] text-muted transition-colors hover:border-line-bright hover:text-ink"
          >
            New game
          </button>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-faint">
        Equal neighbours merge once per move. Reach 2048 to win, then keep
        going.
      </p>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </PanelFrame>
  );
}
