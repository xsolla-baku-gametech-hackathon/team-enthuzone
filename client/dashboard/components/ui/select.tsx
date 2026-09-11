import type { SelectHTMLAttributes } from "react";

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`min-h-9 rounded-control bg-surface-raised px-3 text-sm font-medium text-ink outline-none ring-1 ring-inset ring-line transition hover:ring-line-strong focus:ring-accent-strong ${className}`} {...props}>{children}</select>;
}
