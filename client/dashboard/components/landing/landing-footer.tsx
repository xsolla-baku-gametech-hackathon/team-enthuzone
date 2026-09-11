import Link from "next/link";
import { Activity } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Activity className="size-4 text-accent" aria-hidden="true" />
          Player Issue Intelligence
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted" aria-label="Footer navigation">
          <Link href="/login" className="underline-offset-4 hover:text-ink hover:underline">Sign in</Link>
          <Link href="/register" className="underline-offset-4 hover:text-ink hover:underline">Create account</Link>
          <Link href="#how-it-works" className="underline-offset-4 hover:text-ink hover:underline">How it works</Link>
        </nav>
      </div>
    </footer>
  );
}
