"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { THEME_STORAGE_KEY } from "./theme-key";

export type Theme = "light" | "dark" | "system";

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
 *
 * Classes always mirror the resolved palette so Tailwind `dark:` variants and
 * CSS custom properties stay in sync (including when theme is "system").
 */
function applyToDocument(_theme: Theme, resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.style.colorScheme = resolved;
}

/**
 * Theme state, persisted to storage by zustand rather than by hand.
 *
 * The initial paint is handled by the blocking script in the head, which reads
 * the same storage key; this store takes over once the app hydrates.
 * Default is dark — visitors opt into light themselves.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
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
