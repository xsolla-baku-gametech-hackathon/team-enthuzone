import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "neutral" | "danger" };

export function Button({ variant = "neutral", className = "", ...props }: Props) {
  const tones = {