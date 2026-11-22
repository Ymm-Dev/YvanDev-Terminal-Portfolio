"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_THEME, getCurrentTheme, type ThemeName } from "@/lib/theme";

function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

function getServerSnapshot(): ThemeName {
  return DEFAULT_THEME;
}

/**
 * Read the theme already applied to <html> before paint and stay in sync with
 * changes made anywhere in the app. The server snapshot is the default so the
 * first client render matches the server without a hydration warning.
 */
export function useTheme(): ThemeName {
  return useSyncExternalStore(subscribe, getCurrentTheme, getServerSnapshot);
}
