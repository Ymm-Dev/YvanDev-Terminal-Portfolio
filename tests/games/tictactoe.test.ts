import { describe, expect, it } from "vitest";
import {
  availableMoves,
  bestMove,
  createTicTacToe,
  winnerOf,
  type Board,
} from "@/lib/games/tictactoe";

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function boardWith(marks: Record<number, "X" | "O">): Board {
  const board = createTicTacToe();
  for (const [index, mark] of Object.entries(marks)) {
    board[Number(index)] = mark;
  }
  return board;
}

describe("tic-tac-toe board", () => {
  it("starts empty with every move available", () => {
    const board = createTicTacToe();
    expect(board).toEqual(Array(9).fill(null));
    expect(availableMoves(board)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("detects every winning line", () => {
    for (const line of winningLines) {
      const marks: Record<number, "X" | "O"> = {};
      for (const index of line) marks[index] = "X";
      expect(winnerOf(boardWith(marks))).toBe("X");
    }
  });

  it("detects a draw and an unfinished game", () => {
    expect(
      winnerOf(["X", "O", "X", "X", "O", "O", "O", "X", "X"]),
    ).toBe("draw");
    expect(winnerOf(boardWith({ 0: "X", 4: "O" }))).toBeNull();
  });

  it("lists legal moves only", () => {
    const board = boardWith({ 0: "X", 4: "O", 8: "X" });
    expect(availableMoves(board)).toEqual([1, 2, 3, 5, 6, 7]);
  });
});

describe("minimax opponent", () => {
  it("takes an immediate win", () => {
    const board = boardWith({ 0: "O", 1: "O", 3: "X", 4: "X" });
    expect(bestMove(board)).toBe(2);
  });

  it("blocks an immediate human win", () => {
    const board = boardWith({ 0: "X", 1: "X", 3: "O", 8: "O" });
    expect(bestMove(board)).toBe(2);
  });

  it("returns null on a full board", () => {
    expect(
      bestMove(["X", "O", "X", "X", "O", "O", "O", "X", "X"]),
    ).toBeNull();
  });

  it("never loses from any human reply to the opening centre", () => {
    for (const reply of [0, 1, 2, 3, 5, 6, 7, 8]) {
      const board = createTicTacToe();
      board[4] = "X";
      board[reply] = "O";
      const move = bestMove(board);
      expect(move).not.toBeNull();
    }
  });
});
