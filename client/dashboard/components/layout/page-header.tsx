import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">{title}</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p></div>{actions}</header>;
}
