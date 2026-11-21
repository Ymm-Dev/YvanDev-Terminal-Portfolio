import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BEST_SCORE_KEYS,
  readBestScore,
  saveBestScore,
} from "@/lib/games/storage";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("best score storage", () => {
  it("defaults to zero for both games", () => {
    expect(readBestScore("snake")).toBe(0);
    expect(readBestScore("2048")).toBe(0);
  });

  it("keeps the higher score per game", () => {
    expect(saveBestScore("snake", 40)).toBe(40);
    expect(saveBestScore("snake", 20)).toBe(40);
    expect(saveBestScore("2048", 128)).toBe(128);
    expect(window.localStorage.getItem(BEST_SCORE_KEYS.snake)).toBe("40");
    expect(window.localStorage.getItem(BEST_SCORE_KEYS["2048"])).toBe("128");
  });

  it("ignores malformed or negative stored values", () => {
    window.localStorage.setItem(BEST_SCORE_KEYS.snake, "nope");
    expect(readBestScore("snake")).toBe(0);
    window.localStorage.setItem(BEST_SCORE_KEYS.snake, "-5");
    expect(readBestScore("snake")).toBe(0);
  });

  it("falls back when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readBestScore("snake")).toBe(0);
    expect(saveBestScore("snake", 30)).toBe(30);
  });
});
