"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-row flex-nowrap items-center shrink-0 font-mono text-xs border border-border rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 transition-colors ${
          theme === "light"
            ? "bg-accent font-semibold"
            : "text-text-muted hover:text-text"
        }`}
        style={theme === "light" ? { color: "var(--on-accent)" } : undefined}
      >
        <Sun className="w-3.5 h-3.5 shrink-0" />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 transition-colors ${
          theme === "dark"
            ? "bg-accent font-semibold"
            : "text-text-muted hover:text-text"
        }`}
        style={theme === "dark" ? { color: "var(--on-accent)" } : undefined}
      >
        <Moon className="w-3.5 h-3.5 shrink-0" />
        Dark
      </button>
    </div>
  );
}
