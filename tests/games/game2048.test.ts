import { describe, expect, it } from "vitest";
import {
  create2048,
  hasMoves,
  hasWon,
  move2048,
  spawnTile,
  type Board2048,
} from "@/lib/games/game2048";

/** Always place a new tile in the last free cell and make it a 4. */
const lastSpawn = () => 0.999;
/** Always place a new tile in the first free cell and make it a 2. */
const firstSpawn = () => 0;

function board(rows: Array<Array<number | null>>): Board2048 {
  return rows.flat();
}

const empty = (): Board2048 => Array<number | null>(16).fill(null);

describe("create2048", () => {
  it("starts with exactly two tiles", () => {
    const start = create2048(() => 0);
    expect(start.filter((tile) => tile !== null)).toHaveLength(2);
    expect(start.filter((tile) => tile !== null)).toEqual([2, 2]);
  });
});

describe("moving", () => {
  it("merges a pair and scores its face value", () => {
    const start = board([
      [2, 2, 4, 4],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);

    const result = move2048(start, "left", lastSpawn);
    expect(result.board.slice(0, 4)).toEqual([4, 8, null, null]);
    expect(result.gained).toBe(12);
    expect(result.moved).toBe(true);
  });

  it("merges each tile only once per move", () => {
    const start = board([
      [2, 2, 2, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);

    const result = move2048(start, "left", lastSpawn);
    expect(result.board.slice(0, 4)).toEqual([4, 4, null, null]);
    expect(result.gained).toBe(8);
  });

  it("does not chain merges in the same move", () => {
    const start = board([
      [2, 2, 4, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);

    const result = move2048(start, "left", lastSpawn);
    expect(result.board.slice(0, 4)).toEqual([4, 4, null, null]);
  });

  it("moves right", () => {
    const start = board([
      [2, 2, 4, 4],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);

    const result = move2048(start, "right", lastSpawn);
    expect(result.board.slice(0, 4)).toEqual([null, null, 4, 8]);
  });

  it("moves up", () => {
    const start = board([
      [2, null, null, null],
      [2, null, null, null],
      [4, null, null, null],
      [4, null, null, null],
    ]);

    const result = move2048(start, "up", lastSpawn);
    expect([0, 4, 8, 12].map((index) => result.board[index])).toEqual([
      4,
      8,
      null,
      null,
    ]);
  });

  it("moves down", () => {
    const start = board([
      [2, null, null, null],
      [2, null, null, null],
      [4, null, null, null],
      [4, null, null, null],
    ]);

    const result = move2048(start, "down", lastSpawn);
    expect([0, 4, 8, 12].map((index) => result.board[index])).toEqual([
      null,
      null,
      4,
      8,
    ]);
  });

  it("does not spawn on a no-op move", () => {
    const start = board([
      [2, 4, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);

    const result = move2048(start, "left", firstSpawn);
    expect(result.moved).toBe(false);
    expect(result.board).toEqual(start);
  });

  it("spawns one tile after a changed move", () => {
    const start = board([
      [null, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);

    const result = move2048(start, "left", firstSpawn);
    expect(result.moved).toBe(true);
    expect(result.board.filter((tile) => tile !== null)).toHaveLength(2);
  });

  it("reports a win at 2048", () => {
    const start = board([
      [1024, 1024, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);

    const result = move2048(start, "left", lastSpawn);
    expect(result.won).toBe(true);
    expect(hasWon(result.board)).toBe(true);
  });

  it("reports game over when nothing can move", () => {
    const locked = board([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(hasMoves(locked)).toBe(false);

    const result = move2048(locked, "left", lastSpawn);
    expect(result.moved).toBe(false);
    expect(result.over).toBe(true);
  });
});

describe("spawnTile", () => {
  it("uses the first free cell and a 2 for a low rng", () => {
    const start = empty();
    const next = spawnTile(start, firstSpawn);
    expect(next[0]).toBe(2);
    expect(next.filter((tile) => tile !== null)).toHaveLength(1);
  });

  it("uses a 4 for a high rng", () => {
    const next = spawnTile(empty(), () => 0.95);
    expect(next[15]).toBe(4);
  });

  it("keeps a full board unchanged", () => {
    const full = Array<number | null>(16).fill(2);
    expect(spawnTile(full, firstSpawn)).toEqual(full);
  });
});
