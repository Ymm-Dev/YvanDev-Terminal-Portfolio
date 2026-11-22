import { OPPOSITE, type Direction } from "./direction";

export interface Point {
  x: number;
  y: number;
}

export type SnakeStatus = "idle" | "running" | "paused" | "over";

export interface SnakeState {
  cols: number;
  rows: number;
  /** Head first. */
  snake: Point[];
  food: Point | null;
  direction: Direction;
  /** Pending turns, oldest first. */
  queued: Direction[];
  status: SnakeStatus;
  score: number;
}

export const SNAKE_COLS = 20;
export const SNAKE_ROWS = 14;

const DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function cellKey(point: Point): string {
  return `${point.x},${point.y}`;
}

function placeFood(
  cols: number,
  rows: number,
  snake: Point[],
  rng: () => number,
): Point | null {
  const occupied = new Set(snake.map(cellKey));
  const free: Point[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }

  if (free.length === 0) return null;

  const index = Math.min(free.length - 1, Math.floor(rng() * free.length));
  return free[index] ?? null;
}

export function createSnake(rng: () => number = Math.random): SnakeState {
  const headX = Math.floor(SNAKE_COLS / 2);
  const headY = Math.floor(SNAKE_ROWS / 2);
  const snake: Point[] = [
    { x: headX, y: headY },
    { x: headX - 1, y: headY },
    { x: headX - 2, y: headY },
  ];

  return {
    cols: SNAKE_COLS,
    rows: SNAKE_ROWS,
    snake,
    food: placeFood(SNAKE_COLS, SNAKE_ROWS, snake, rng),
    direction: "right",
    queued: [],
    status: "idle",
    score: 0,
  };
}

export function startSnake(state: SnakeState): SnakeState {
  return { ...state, status: "running" };
}

export function pauseSnake(state: SnakeState): SnakeState {
  return state.status === "running" ? { ...state, status: "paused" } : state;
}

export function resumeSnake(state: SnakeState): SnakeState {
  return state.status === "paused" ? { ...state, status: "running" } : state;
}

export function turnSnake(state: SnakeState, direction: Direction): SnakeState {
  if (state.status === "over") return state;
  if (state.queued.length >= 2) return state;

  const effective = state.queued[state.queued.length - 1] ?? state.direction;
  if (direction === effective || direction === OPPOSITE[effective]) return state;

  return { ...state, queued: [...state.queued, direction] };
}

export function stepSnake(
  state: SnakeState,
  rng: () => number = Math.random,
): SnakeState {
  if (state.status !== "running") return state;

  const direction = state.queued[0] ?? state.direction;
  const queued = state.queued.slice(1);
  const delta = DELTAS[direction];
  const head = state.snake[0]!;
  const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

  if (
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.cols ||
    nextHead.y >= state.rows
  ) {
    return { ...state, direction, queued, status: "over" };
  }

  const eating = state.food !== null && samePoint(nextHead, state.food);
  const body = state.snake.slice(
    0,
    eating ? state.snake.length : state.snake.length - 1,
  );

  if (body.some((segment) => samePoint(segment, nextHead))) {
    return { ...state, direction, queued, status: "over" };
  }

  const snake = eating
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)];

  return {
    ...state,
    snake,
    direction,
    queued,
    food: eating ? placeFood(state.cols, state.rows, snake, rng) : state.food,
    score: eating ? state.score + 10 : state.score,
  };
}
