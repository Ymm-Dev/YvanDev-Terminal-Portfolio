"use client";

import { useEffect, useState } from "react";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { useTerminal } from "@/components/terminal/context";
import { readBestScore, type ScoreGame } from "@/lib/games/storage";

interface ArcadeCard {
  command: string;
  label: string;
  summary: string;
  controls: string;
  score: ScoreGame | null;
}

const games: ArcadeCard[] = [
  {
    command: "snake",
    label: "Snake",
    summary: "Eat, grow, and keep your tail out of trouble.",
    controls: "arrows / WASD · space pauses",
    score: "snake",
  },
  {
    command: "tictactoe",
    label: "Tic-Tac-Toe",
    summary: "You are X. The shell plays a perfect O.",
    controls: "click a cell · new round anytime",
    score: null,
  },
  {
    command: "2048",
    label: "2048",
    summary: "Slide equal tiles together until you reach 2048.",
    controls: "arrows / WASD · reach 2048 to win",
    score: "2048",
  },
];

export function GamesPanel({ id }: { id?: string }) {
  const { run } = useTerminal();
  const [best, setBest] = useState<Partial<Record<ScoreGame, number>>>({});

  useEffect(() => {
    setBest({
      snake: readBestScore("snake"),
      "2048": readBestScore("2048"),
    });
  }, []);

  return (
    <PanelFrame
      id={id}
      label="arcade"
      meta="3 games"
      tone="accent"
      footer={<span>games · snake · tictactoe · 2048</span>}
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {games.map((game) => {
          const score = game.score ? best[game.score] : undefined;
          return (
            <button
              key={game.command}
              type="button"
              onClick={() => run(game.command)}
              className="group flex flex-col gap-1.5 rounded border border-line bg-bg/40 p-3 text-left transition-colors hover:border-line-bright hover:bg-surface-2 focus-visible:border-green"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-ink group-hover:text-green">
                  {game.label}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-faint">
                  {score ? `best ${score}` : "start"}
                </span>
              </span>
              <span className="text-[11px] text-muted">{game.summary}</span>
              <span className="text-[10px] text-faint">{game.controls}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-faint">
        Best scores stay in this browser. No accounts, no leaderboard.
      </p>
    </PanelFrame>
  );
}
