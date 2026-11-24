"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const THEME_KEY = "ourtube-theme";

export function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange(event: MediaQueryListEvent) {
      try {
        if (localStorage.getItem(THEME_KEY)) {
          return;
        }
      } catch {
        return;
      }

      const root = document.documentElement;
      root.classList.toggle("dark", event.matches);
      root.style.colorScheme = event.matches ? "dark" : "light";
    }

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nextIsDark);
    root.style.colorScheme = nextIsDark ? "dark" : "light";

    try {
      localStorage.setItem(THEME_KEY, nextIsDark ? "dark" : "light");
    } catch {
      return;
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
    >
      <Sun className="hidden h-5 w-5 dark:block" />
      <Moon className="h-5 w-5 dark:hidden" />
    </button>
  );
}
