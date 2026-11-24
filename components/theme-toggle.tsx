"use client";

import { MoonIcon, SunIcon } from "@/components/icons";

const THEME_KEY = "our-tube-theme";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nextIsDark);

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
      className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
    >
      <SunIcon className="hidden h-[18px] w-[18px] dark:block" />
      <MoonIcon className="h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}
