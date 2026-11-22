import { describe, expect, it } from "vitest";
import {
  createSnake,
  pauseSnake,
  resumeSnake,
  startSnake,
  stepSnake,
  turnSnake,
  type SnakeState,
} from "@/lib/games/snake";

const fixedRng = () => 0.5;

function running(state: SnakeState = createSnake(fixedRng)): SnakeState {
  return startSnake(state);
}

describe("createSnake", () => {
  it("starts with three centred segments facing right", () => {
    const state = createSnake(fixedRng);
    expect(state.cols).toBe(20);
    expect(state.rows).toBe(14);
    expect(state.snake).toHaveLength(3);
    expect(state.snake[0]).toEqual({ x: 10, y: 7 });
    expect(state.snake[1]).toEqual({ x: 9, y: 7 });
    expect(state.snake[2]).toEqual({ x: 8, y: 7 });
    expect(state.direction).toBe("right");
    expect(state.status).toBe("idle");
    expect(state.score).toBe(0);
  });

  it("places food on a free cell", () => {
    const state = createSnake(fixedRng);
    expect(state.food).not.toBeNull();
    const occupied = state.snake.some(
      (segment) => segment.x === state.food!.x && segment.y === state.food!.y,
    );
    expect(occupied).toBe(false);
  });

  it("is deterministic for a fixed rng", () => {
    expect(createSnake(fixedRng).food).toEqual(createSnake(fixedRng).food);
  });
});

describe("status transitions", () => {
  it("starts running", () => {
    expect(running().status).toBe("running");
  });

  it("pauses and resumes", () => {
    const paused = pauseSnake(running());
    expect(paused.status).toBe("paused");
    expect(resumeSnake(paused).status).toBe("running");
  });

  it("does not advance while idle or paused", () => {
    const idle = createSnake(fixedRng);
    expect(stepSnake(idle, fixedRng)).toEqual(idle);
    const paused = pauseSnake(running());
    expect(stepSnake(paused, fixedRng)).toEqual(paused);
  });
});

describe("turning", () => {
  it("rejects an immediate reversal", () => {
    const state = turnSnake(running(), "left");
    expect(state.direction).toBe("right");
    expect(state.queued).toEqual([]);
  });

  it("queues at most two safe turns", () => {
    let state = running();
    state = turnSnake(state, "down");
    state = turnSnake(state, "left");
    expect(state.queued).toEqual(["down", "left"]);

    state = turnSnake(state, "up");
    expect(state.queued).toEqual(["down", "left"]);
  });

  it("consumes one queued turn per step", () => {
    let state = running();
    state = turnSnake(state, "down");
    state = turnSnake(state, "left");

    const first = stepSnake(state, fixedRng);
    expect(first.direction).toBe("down");
    expect(first.queued).toEqual(["left"]);

    const second = stepSnake(first, fixedRng);
    expect(second.direction).toBe("left");
    expect(second.queued).toEqual([]);
  });
});

describe("stepping", () => {
  it("advances the head by one cell", () => {
    const state = running();
    const next = stepSnake(state, fixedRng);
    expect(next.snake[0]).toEqual({ x: 11, y: 7 });
    expect(next.snake).toHaveLength(3);
  });

  it("grows and scores when eating", () => {
    const state: SnakeState = {
      cols: 5,
      rows: 5,
      snake: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      food: { x: 2, y: 1 },
      direction: "right",
      queued: [],
      status: "running",
      score: 0,
    };

    const next = stepSnake(state, () => 0);
    expect(next.snake[0]).toEqual({ x: 2, y: 1 });
    expect(next.snake).toHaveLength(3);
    expect(next.score).toBe(10);
    expect(next.food).not.toBeNull();
    expect(next.food).not.toEqual({ x: 2, y: 1 });
  });

  it("ends on a wall collision", () => {
    const state: SnakeState = {
      cols: 5,
      rows: 5,
      snake: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      food: null,
      direction: "left",
      queued: [],
      status: "running",
      score: 0,
    };

    expect(stepSnake(state, fixedRng).status).toBe("over");
  });

  it("ends on a body collision", () => {
    const state: SnakeState = {
      cols: 5,
      rows: 5,
      snake: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 1 },
      ],
      food: null,
      direction: "right",
      queued: [],
      status: "running",
      score: 0,
    };

    expect(stepSnake(state, fixedRng).status).toBe("over");
  });

  it("allows moving into the cell the tail is leaving", () => {
    const state: SnakeState = {
      cols: 5,
      rows: 5,
      snake: [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 1, y: 1 },
      ],
      food: null,
      direction: "right",
      queued: [],
      status: "running",
      score: 0,
    };

    const next = stepSnake(state, fixedRng);
    expect(next.status).toBe("running");
    expect(next.snake[0]).toEqual({ x: 1, y: 1 });
  });
});
