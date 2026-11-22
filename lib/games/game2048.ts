import type { Direction } from "./direction";

/** 16 cells, row-major. */
export type Board2048 = Array<number | null>;

export interface Move2048 {
  board: Board2048;
  gained: number;
  moved: boolean;
  won: boolean;
  over: boolean;
}

function emptyBoard(): Board2048 {
  return Array<number | null>(16).fill(null);
}

function buildLines(): Record<Direction, number[][]> {
  const rows = Array.from({ length: 4 }, (_, row) =>
    [0, 1, 2, 3].map((column) => row * 4 + column),
  );
  const columns = Array.from({ length: 4 }, (_, column) =>
    [0, 1, 2, 3].map((row) => row * 4 + column),
  );

  return {
    left: rows,
    right: rows.map((line) => [...line].reverse()),
    up: columns,
    down: columns.map((line) => [...line].reverse()),
  };
}

const LINES = buildLines();

function mergeLine(values: number[]): { merged: number[]; gained: number } {
  const merged: number[] = [];
  let gained = 0;

  for (let index = 0; index < values.length; index += 1) {
    const current = values[index]!;
    if (values[index + 1] === current) {
      const combined = current * 2;
      merged.push(combined);
      gained += combined;
      index += 1;
    } else {
      merged.push(current);
    }
  }

  return { merged, gained };
}

export function spawnTile(
  board: Board2048,
  rng: () => number = Math.random,
): Board2048 {
  const free: number[] = [];
  board.forEach((tile, index) => {
    if (tile === null) free.push(index);
  });

  if (free.length === 0) return board;

  const position =
    free[Math.min(free.length - 1, Math.floor(rng() * free.length))]!;
  const value = rng() < 0.9 ? 2 : 4;
  const next = [...board];
  next[position] = value;
  return next;
}

export function create2048(rng: () => number = Math.random): Board2048 {
  return spawnTile(spawnTile(emptyBoard(), rng), rng);
}

export function hasWon(board: Board2048): boolean {
  return board.some((tile) => tile !== null && tile >= 2048);
}

export function hasMoves(board: Board2048): boolean {
  return board.some((tile, index) => {
    if (tile === null) return true;

    const row = Math.floor(index / 4);
    const column = index % 4;
    if (column < 3 && board[index + 1] === tile) return true;
    if (row < 3 && board[index + 4] === tile) return true;
    return false;
  });
}

export function move2048(
  board: Board2048,
  direction: Direction,
  rng: () => number = Math.random,
): Move2048 {
  const next = [...board];
  let gained = 0;
  let moved = false;

  for (const line of LINES[direction]) {
    const values = line
      .map((index) => next[index])
      .filter((tile): tile is number => tile !== null);
    const result = mergeLine(values);
    gained += result.gained;

    line.forEach((index, position) => {
      const value = result.merged[position] ?? null;
      if (next[index] !== value) moved = true;
      next[index] = value;
    });
  }

  if (!moved) {
    return {
      board: next,
      gained,
      moved,
      won: hasWon(next),
      over: !hasMoves(next),
    };
  }

  const spawned = spawnTile(next, rng);
  return {
    board: spawned,
    gained,
    moved,
    won: hasWon(spawned),
    over: !hasMoves(spawned),
  };
}
