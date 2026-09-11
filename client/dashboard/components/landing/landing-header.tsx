import Link from "next/link";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNavigation } from "@/components/landing/mobile-navigation";

const nav = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#ai-playtest", label: "AI playtest" },
  { href: "#release-proof", label: "Release proof" },
  { href: "#for-teams", label: "For teams" },
];

export function LandingHeader() {
  return (
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/landing"
          className="inline-flex items-center gap-2.5 font-semibold tracking-[-0.02em] text-ink"
          aria-label="Player Issue Intelligence home"
        >
          <Activity className="size-5 text-accent" aria-hidden="true" />
          <span>Player Issue Intelligence</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-control px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-raised"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-10 items-center justify-center rounded-control bg-accent px-4 text-sm font-semibold text-canvas transition-colors hover:bg-accent-strong"
          >
            Create account
          </Link>
        </div>

        <MobileNavigation />
      </div>
    </header>
  );
}
