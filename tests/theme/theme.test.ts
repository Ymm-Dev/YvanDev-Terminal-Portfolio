import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  DEFAULT_THEME,
  getCurrentTheme,
  isThemeName,
  normalizeTheme,
  readStoredTheme,
  THEME_BACKGROUNDS,
  THEME_NAMES,
  THEME_STORAGE_KEY,
  THEMES,
  themeLabel,
} from "@/lib/theme";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.head.innerHTML = '<meta name="theme-color" content="#0a0b0d" />';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("theme registry", () => {
  it("ships the four approved themes in order", () => {
    expect(THEMES.map((theme) => theme.name)).toEqual([
      "midnight",
      "paper",
      "amber",
      "cobalt",
    ]);
    expect(new Set(THEME_NAMES).size).toBe(4);
    expect(DEFAULT_THEME).toBe("midnight");
    expect(themeLabel("paper")).toBe("Paper");
    expect(THEME_BACKGROUNDS.paper).toBe("#f4efe4");
  });

  it("normalizes known and unknown values", () => {
    expect(isThemeName("cobalt")).toBe(true);
    expect(isThemeName("nope")).toBe(false);
    expect(normalizeTheme("amber")).toBe("amber");
    expect(normalizeTheme("nope")).toBe("midnight");
    expect(normalizeTheme(null)).toBe("midnight");
  });

  it("stores and reads the selected theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "paper");
    expect(readStoredTheme()).toBe("paper");
    localStorage.setItem(THEME_STORAGE_KEY, "nonsense");
    expect(readStoredTheme()).toBe("midnight");
  });

  it("falls back when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readStoredTheme()).toBe("midnight");
  });
});

describe("applyTheme", () => {
  it("applies, persists, updates the browser color, and announces", () => {
    const listener = vi.fn();
    window.addEventListener("themechange", listener);

    applyTheme("paper");

    expect(document.documentElement.dataset.theme).toBe("paper");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("paper");
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
    ).toBe("#f4efe4");
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      theme: "paper",
    });

    window.removeEventListener("themechange", listener);
  });

  it("removes the attribute for midnight", () => {
    applyTheme("amber");
    applyTheme("midnight");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(getCurrentTheme()).toBe("midnight");
  });

  it("normalizes the attribute when read", () => {
    document.documentElement.dataset.theme = "BOGUS";
    expect(getCurrentTheme()).toBe("midnight");
  });
});
