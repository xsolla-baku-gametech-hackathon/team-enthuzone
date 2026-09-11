import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "neutral" | "danger" };

export function Button({ variant = "neutral", className = "", ...props }: Props) {
  const tones = {
    primary: "bg-accent text-canvas hover:bg-accent-strong",
    neutral: "bg-surface-raised text-ink hover:bg-line",