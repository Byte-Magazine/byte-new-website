"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

/** Shared with the blocking script in the document head. */
export const THEME_STORAGE_KEY = "byte-theme";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  /** Recomputes the resolved theme; called when the OS preference changes. */
  syncSystem: () => void;
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return systemPrefersDark() ? "dark" : "light";
}

/**
 * Writes the theme to the document: the class an explicit choice needs, plus
 * `color-scheme` so native controls and scrollbars follow.
 */
function applyToDocument(theme: Theme, resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Only an explicit choice sets a class; "system" leaves both off so the
  // prefers-color-scheme rules in the stylesheet apply.
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = resolved;
}

/**
 * Theme state, persisted to storage by zustand rather than by hand.
 *
 * The initial paint is handled by the blocking script in the head, which reads
 * the same storage key; this store takes over once the app hydrates.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "dark",

      setTheme: (theme) => {
        const resolvedTheme = resolve(theme);
        applyToDocument(theme, resolvedTheme);
        set({ theme, resolvedTheme });
      },

      syncSystem: () => {
        if (get().theme !== "system") return;
        const resolvedTheme = resolve("system");
        applyToDocument("system", resolvedTheme);
        set({ resolvedTheme });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Align the resolved value with what the head script already painted.
        state?.setTheme(state.theme);
      },
    },
  ),
);
