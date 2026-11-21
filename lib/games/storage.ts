export const BEST_SCORE_KEYS = {
  snake: "yvan-best-snake",
  "2048": "yvan-best-2048",
} as const;

export type ScoreGame = keyof typeof BEST_SCORE_KEYS;

function clampScore(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function readBestScore(game: ScoreGame): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEYS[game]);
    if (raw === null) return 0;
    return clampScore(Number(raw));
  } catch {
    return 0;
  }
}

export function saveBestScore(game: ScoreGame, score: number): number {
  const next = Math.max(readBestScore(game), clampScore(score));
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(BEST_SCORE_KEYS[game], String(next));
  } catch {
    // Private mode or disabled storage: the score still stands this session.
  }
  return next;
}
