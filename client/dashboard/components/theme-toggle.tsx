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