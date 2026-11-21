export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Board = Cell[];
export type Winner = Mark | "draw" | null;

const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createTicTacToe(): Board {
  return Array<Cell>(9).fill(null);
}

export function winnerOf(board: Board): Winner {
  for (const [a, b, c] of LINES) {
    const mark = board[a];
    if (mark !== null && mark !== undefined && mark === board[b] && mark === board[c]) {
      return mark;
    }
  }
  return board.every((cell) => cell !== null) ? "draw" : null;
}

export function availableMoves(board: Board): number[] {
  const moves: number[] = [];
  board.forEach((cell, index) => {
    if (cell === null) moves.push(index);
  });
  return moves;
}

function score(
  board: Board,
  turn: Mark,
  ai: Mark,
  human: Mark,
  depth: number,
): number {
  const winner = winnerOf(board);
  if (winner === ai) return 10 - depth;
  if (winner === human) return depth - 10;
  if (winner === "draw") return 0;

  const moves = availableMoves(board);
  const maximizing = turn === ai;
  let best = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    board[move] = turn;
    const value = score(board, turn === ai ? human : ai, ai, human, depth + 1);
    board[move] = null;
    best = maximizing ? Math.max(best, value) : Math.min(best, value);
  }

  return best;
}

export function bestMove(
  board: Board,
  ai: Mark = "O",
  human: Mark = "X",
): number | null {
  const working = [...board];
  let bestScore = -Infinity;
  let best: number | null = null;

  for (const move of availableMoves(working)) {
    working[move] = ai;
    const value = score(working, human, ai, human, 1);
    working[move] = null;

    // Strictly greater keeps the lowest index when several moves tie.
    if (value > bestScore) {
      bestScore = value;
      best = move;
    }
  }

  return best;
}
