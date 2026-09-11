"use client";
import { SunMoon } from "lucide-react";
export function ThemeToggle() {
  return (
    <button
      className="secondary"
      aria-label="Toggle light or dark mode"
      onClick={() => {
        const next =
          document.documentElement.dataset.theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = next;
        document.cookie = `theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }}
    >
      <SunMoon size={18} />