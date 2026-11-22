"use client";

import type { Direction } from "@/lib/games/direction";

const buttons: Array<{
  direction: Direction;
  label: string;
  symbol: string;
  position: string;
}> = [
  { direction: "up", label: "Up", symbol: "↑", position: "col-start-2 row-start-1" },
  { direction: "left", label: "Left", symbol: "←", position: "col-start-1 row-start-2" },
  { direction: "down", label: "Down", symbol: "↓", position: "col-start-2 row-start-2" },
  { direction: "right", label: "Right", symbol: "→", position: "col-start-3 row-start-2" },
];

export function DirectionPad({
  onDirection,
  disabled = false,
}: {
  onDirection: (direction: Direction) => void;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label="Direction pad" className="grid grid-cols-3 gap-1">
      {buttons.map((button) => (
        <button
          key={button.direction}
          type="button"
          aria-label={button.label}
          disabled={disabled}
          onClick={() => onDirection(button.direction)}
          className={`${button.position} grid size-11 place-items-center rounded border border-line bg-surface-2 text-[15px] text-ink transition-colors hover:border-line-bright disabled:opacity-40`}
        >
          <span aria-hidden>{button.symbol}</span>
        </button>
      ))}
    </div>
  );
}
