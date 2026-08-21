"use client";

import { Moon, Sun } from "lucide-react";

import { THEME_STORAGE_KEY } from "@/lib/clipper/theme";
import { cn } from "@/lib/utils";

/**
 * The `.dark` class is set on <html> before paint (see themeInitScript), so the
 * icons swap through the dark: variant rather than React state — no flash, no
 * hydration mismatch.
 */
export function ThemeToggle({
  className = "",
  tone = "prism",
}: {
  className?: string;
  tone?: "prism" | "warm";
}) {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private browsing: the choice just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
        tone === "warm"
          ? "border-warm-line bg-warm-surface text-warm-ink hover:border-warm-accent hover:text-warm-accent"
          : "border-line bg-surface text-ink-muted hover:border-brand hover:text-brand",
        className,
      )}
    >
      <Moon aria-hidden="true" className="size-4 dark:hidden" />
      <Sun aria-hidden="true" className="hidden size-4 dark:block" />
    </button>
  );
}
