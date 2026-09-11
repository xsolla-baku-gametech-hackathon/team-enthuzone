"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#ai-playtest", label: "AI playtest" },
  { href: "#release-proof", label: "Release proof" },
  { href: "#for-teams", label: "For teams" },
];

export function MobileNavigation() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => detailsRef.current?.removeAttribute("open");

  return (
    <details ref={detailsRef} className="relative md:hidden">
      <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-control border border-line bg-surface text-ink [&::-webkit-details-marker]:hidden">
        <Menu className="size-5" aria-hidden="true" />
        <span className="sr-only">Open navigation</span>
      </summary>
      <div className="absolute right-0 top-12 z-50 w-64 border border-line bg-surface p-3">
        <nav className="grid" aria-label="Mobile navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu} className="border-b border-line px-3 py-3 text-sm font-semibold text-ink last:border-0">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
          <Link href="/login" onClick={closeMenu} className="inline-flex min-h-10 items-center justify-center rounded-control bg-surface-raised px-3 text-sm font-semibold text-ink">
            Sign in
          </Link>
          <Link href="/register" onClick={closeMenu} className="inline-flex min-h-10 items-center justify-center rounded-control bg-accent px-3 text-sm font-semibold text-canvas">
            Create
          </Link>
          <div className="col-span-2"><ThemeToggle /></div>
        </div>
      </div>
    </details>
  );
}
