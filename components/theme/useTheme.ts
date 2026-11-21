"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  getCurrentTheme,
  normalizeTheme,
  type ThemeName,
} from "@/lib/theme";

/**
 * Read the theme already applied to <html> before paint and stay in sync with
 * changes made anywhere in the app. The server and first client render both
 * use the default so hydration stays quiet.
 */
export function useTheme(): ThemeName {
  const [theme, setTheme] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    setTheme(getCurrentTheme());

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ theme?: unknown }>).detail;
      setTheme(normalizeTheme(detail?.theme));
    };

    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);

  return theme;
}
