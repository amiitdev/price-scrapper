"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved && saved !== useUIStore.getState().theme) {
      useUIStore.getState().setTheme(saved);
    }
  }, []);

  return <>{children}</>;
}
