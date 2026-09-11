import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "neutral" | "danger" };

export function Button({ variant = "neutral", className = "", ...props }: Props) {
  const tones = {
    primary: "bg-accent text-canvas hover:bg-accent-strong",
    neutral: "bg-surface-raised text-ink hover:bg-line",
    danger: "bg-critical text-ink hover:bg-critical-surface",
  };
  return <button className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-control px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tones[variant]} ${className}`} {...props} />;
}
