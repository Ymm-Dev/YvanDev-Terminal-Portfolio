export interface ThemeDefinition {
  name: string;
  label: string;
  summary: string;
  scheme: "dark" | "light";
}

export const THEMES = [
  {
    name: "midnight",
    label: "Midnight",
    summary: "The original dark shell.",
    scheme: "dark",
  },
  {
    name: "paper",
    label: "Paper",
    summary: "Warm daylight for long reads.",
    scheme: "light",
  },
  {
    name: "amber",
    label: "Amber",
    summary: "A warm CRT glow.",
    scheme: "dark",
  },
  {
    name: "cobalt",
    label: "Cobalt",
    summary: "Cold, high-contrast blue.",
    scheme: "dark",
  },
] as const satisfies readonly ThemeDefinition[];

export type ThemeName = (typeof THEMES)[number]["name"];

export const THEME_NAMES: readonly ThemeName[] = THEMES.map(
  (theme) => theme.name,
);

export const DEFAULT_THEME: ThemeName = "midnight";

export const THEME_STORAGE_KEY = "yvan-portfolio-theme";

export const THEME_BACKGROUNDS: Record<ThemeName, string> = {
  midnight: "#0a0b0d",
  paper: "#f4efe4",
  amber: "#100d08",
  cobalt: "#070b14",
};

export function isThemeName(value: unknown): value is ThemeName {
  return (
    typeof value === "string" &&
    (THEME_NAMES as readonly string[]).includes(value)
  );
}

export function normalizeTheme(value: unknown): ThemeName {
  return isThemeName(value) ? value : DEFAULT_THEME;
}

export function themeLabel(name: ThemeName): string {
  return THEMES.find((theme) => theme.name === name)?.label ?? "Midnight";
}

export function readStoredTheme(): ThemeName {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

export function getCurrentTheme(): ThemeName {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return normalizeTheme(document.documentElement.dataset.theme);
}

export function applyTheme(name: ThemeName): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (name === DEFAULT_THEME) {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = name;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, name);
  } catch {
    // Private mode or disabled storage: keep the theme for this session.
  }

  let meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
  }
  meta.content = THEME_BACKGROUNDS[name];

  window.dispatchEvent(
    new CustomEvent("themechange", { detail: { theme: name } }),
  );
}
