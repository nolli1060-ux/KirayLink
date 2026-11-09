"use client";

import {
  useCallback,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "kiraylink-theme";

type ThemeSubscriber = () => void;

const themeSubscribers = new Set<ThemeSubscriber>();
let systemThemeQuery: MediaQueryList | null = null;

function readStoredTheme(): Theme | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : null;
  } catch (error) {
    console.warn("Unable to read the saved theme preference.", error);
    return null;
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function notifyThemeSubscribers(): void {
  themeSubscribers.forEach((subscriber) => subscriber());
}

function handleSystemThemeChange(event: MediaQueryListEvent): void {
  if (readStoredTheme() === null) {
    applyTheme(event.matches ? "dark" : "light");
    notifyThemeSubscribers();
  }
}

function subscribeToTheme(subscriber: ThemeSubscriber): () => void {
  themeSubscribers.add(subscriber);
  if (!systemThemeQuery) {
    systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemThemeQuery.addEventListener("change", handleSystemThemeChange);
  }

  return () => {
    themeSubscribers.delete(subscriber);
    if (themeSubscribers.size === 0 && systemThemeQuery) {
      systemThemeQuery.removeEventListener("change", handleSystemThemeChange);
      systemThemeQuery = null;
    }
  };
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function useCurrentTheme(): Theme {
  return useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );
}

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useCurrentTheme();
  return children;
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  return {
    theme: useCurrentTheme(),
    toggleTheme: useCallback(() => {
      const currentTheme = getThemeSnapshot();
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(nextTheme);

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch (error) {
        console.warn("Unable to save the theme preference.", error);
      }

      notifyThemeSubscribers();
    }, []),
  };
}
