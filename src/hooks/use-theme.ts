"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "woofie-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
      setTheme("dark");
    }
  }, []);

  function applyTheme(next: Theme) {
    console.log("useTheme: Applying theme attribute to documentElement:", next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    console.log("useTheme: Toggling theme from", theme, "to", next);
    applyTheme(next);
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { theme, toggleTheme };
}
