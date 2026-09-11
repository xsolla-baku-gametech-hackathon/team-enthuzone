"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { request } from "@/lib/api/platform";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function Topbar() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <header data-dialog-background className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas px-4 py-3 sm:px-6 lg:px-8">
      <span className="eyebrow">PLAYER INTELLIGENCE PLATFORM</span>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          className="secondary"
          onClick={async () => {
            try {
              await request("/session/logout", {});
              router.push("/login");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Sign out
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-critical">
          {error}
        </p>
      )}
    </header>
  );
}
