"use client";

import { useEffect, useRef, useState } from "react";
import { PanelFrame } from "@/components/ui/PanelFrame";
import {
  bestMove,
  createTicTacToe,
  winnerOf,
  type Board,
} from "@/lib/games/tictactoe";

type Phase = "your turn" | "shell thinking" | "you win" | "shell wins" | "draw";

const PHASE_TEXT: Record<Phase, string> = {
  "your turn": "your turn",
  "shell thinking": "shell thinking",
  "you win": "you win",
  "shell wins": "shell wins",
  draw: "draw",
};

interface Tally {
  wins: number;
  draws: number;
  losses: number;
}

const EMPTY_TALLY: Tally = { wins: 0, draws: 0, losses: 0 };

function cellLabel(index: number, mark: string | null): string {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  return `Row ${row}, column ${column}${mark ? `, ${mark}` : ", empty"}`;
}

export function TicTacToeGame({ id }: { id?: string }) {
  const [board, setBoard] = useState<Board>(createTicTacToe);
  const [phase, setPhase] = useState<Phase>("your turn");
  const [tally, setTally] = useState<Tally>(EMPTY_TALLY);
  const [announcement, setAnnouncement] = useState(
    "Tic-Tac-Toe ready. You are X and move first.",
  );
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const roundRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);

  const finished =
    phase === "you win" || phase === "shell wins" || phase === "draw";

  useEffect(() => {
    if (finished) {
      roundRef.current?.focus();
      return;
    }
    if (phase === "shell thinking") return;
    const index = board.findIndex((cell) => cell === null);
    if (index >= 0) cellRefs.current[index]?.focus();
  }, [board, phase, finished]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const place = (index: number) => {
    if (finished || phase === "shell thinking" || board[index] !== null) {
      return;
    }

    const next = [...board];
    next[index] = "X";
    const result = winnerOf(next);
    setBoard(next);

    if (result === "X") {
      setPhase("you win");
      setTally((current) => ({ ...current, wins: current.wins + 1 }));
      setAnnouncement("You win this round.");
      return;
    }
    if (result === "draw") {
      setPhase("draw");
      setTally((current) => ({ ...current, draws: current.draws + 1 }));
      setAnnouncement("Draw. Nobody wins this round.");
      return;
    }

    setPhase("shell thinking");
    setAnnouncement("Shell is thinking.");

    timer.current = window.setTimeout(() => {
      timer.current = null;
      const move = bestMove(next);
      if (move === null) {
        setPhase("draw");
        setTally((current) => ({ ...current, draws: current.draws + 1 }));
        setAnnouncement("Draw. Nobody wins this round.");
        return;
      }

      const after = [...next];
      after[move] = "O";
      const shellResult = winnerOf(after);
      setBoard(after);

      if (shellResult === "O") {
        setPhase("shell wins");
        setTally((current) => ({ ...current, losses: current.losses + 1 }));
        setAnnouncement("Shell wins this round.");
      } else if (shellResult === "draw") {
        setPhase("draw");
        setTally((current) => ({ ...current, draws: current.draws + 1 }));
        setAnnouncement("Draw. Nobody wins this round.");
      } else {
        setPhase("your turn");
        setAnnouncement("Your turn. You are X.");
      }
    }, 350);
  };

  const newRound = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setBoard(createTicTacToe());
    setPhase("your turn");
    setAnnouncement("New round. You are X and move first.");
  };

  const locked = phase === "shell thinking" || finished;

  return (
    <PanelFrame
      id={id}
      label="tic-tac-toe"
      meta={`w ${tally.wins} · d ${tally.draws} · l ${tally.losses}`}
      footer={<span>you are X · X moves first · new round anytime</span>}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
        <div
          role="group"
          aria-label="Tic-Tac-Toe board"
          className="grid w-full max-w-[280px] grid-cols-3 gap-1"
        >
          {board.map((cell, index) => (
            <button
              key={index}
              ref={(element) => {
                cellRefs.current[index] = element;
              }}
              type="button"
              aria-label={cellLabel(index, cell)}
              aria-pressed={cell !== null}
              aria-disabled={cell !== null || locked}
              onClick={() => place(index)}
              className={`grid aspect-square place-items-center rounded border bg-bg/40 text-xl font-medium transition-colors ${
                cell === "X"
                  ? "border-green/60 text-green"
                  : cell === "O"
                    ? "border-red/50 text-red"
                    : "border-line text-ink hover:border-line-bright"
              } ${locked ? "cursor-default" : "cursor-pointer"}`}
            >
              {cell ?? ""}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[11px]">
            <span className="text-ink" data-testid="ttt-status">
              {PHASE_TEXT[phase]}
            </span>
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-faint">
            <span>wins {tally.wins}</span>
            <span>draws {tally.draws}</span>
            <span>losses {tally.losses}</span>
          </div>
          <button
            ref={roundRef}
            type="button"
            onClick={newRound}
            className="min-h-9 w-fit rounded border border-line px-3 text-[12px] text-muted transition-colors hover:border-line-bright hover:text-ink"
          >
            New round
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </PanelFrame>
  );
}
