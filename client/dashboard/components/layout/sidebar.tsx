"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  GitCompareArrows,
  LayoutDashboard,
  MessageSquareText,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { fetchCurrentSession } from "@/lib/api/session";
import { useEffect, useState } from "react";

const baseNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/issues", label: "Issues", icon: ShieldAlert },
  { href: "/feedback", label: "Feedback", icon: MessageSquareText },
  { href: "/telemetry", label: "Telemetry", icon: Activity },
  { href: "/compare", label: "Compare builds", icon: GitCompareArrows },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const nav = isSuperAdmin
    ? [
        ...baseNav,
        { href: "/admin/logs", label: "Admin logs", icon: ShieldCheck },
      ]
    : baseNav;

  useEffect(() => {
    let active = true;
    fetchCurrentSession()
      .then((session) => {
        if (active) setIsSuperAdmin(session.user.isSuperAdmin === true);
      })
      .catch(() => {
        if (active) setIsSuperAdmin(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {/* Mobile Top Navigation */}
      <aside data-dialog-background className="sticky top-0 z-30 flex min-w-0 max-w-full flex-col border-b border-line bg-sidebar/95 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="relative grid size-9 place-items-center overflow-hidden rounded-full border border-line bg-surface-raised shadow-xs">
              <Image src="/logo.png" alt="GoBuster Mascot Logo" width={32} height={32} className="object-contain" priority />
            </span>
            <div>
              <div className="text-sm font-bold text-ink tracking-tight">GoBuster</div>
              <div className="text-[11px] font-medium text-muted">Issue Intelligence</div>
            </div>
          </div>
        </div>
        <nav
          className="flex max-w-full gap-1 overflow-x-auto px-3 pb-3"
          aria-label="Mobile navigation"
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-11 min-w-max items-center gap-2 rounded-control px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-surface-raised text-ink"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Persistent Fixed Full-Height Sidebar */}
      <aside
        data-dialog-background
        className="fixed inset-y-0 left-0 z-30 hidden h-screen w-60 flex-col border-r border-line bg-sidebar lg:flex"
        aria-label="Sidebar navigation"
      >
        <div className="flex h-20 shrink-0 items-center gap-3 px-5 border-b border-line/50">
          <span className="relative grid size-11 place-items-center overflow-hidden rounded-full border border-line/80 bg-surface-raised shadow-sm">
            <Image src="/logo.png" alt="GoBuster Mascot Logo" width={38} height={38} className="object-contain" priority />
          </span>
          <div>
            <div className="text-base font-bold text-ink tracking-tight">
              GoBuster
            </div>
            <div className="text-xs font-medium text-muted">Issue Intelligence</div>
          </div>
        </div>

        <nav
          className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5"
          aria-label="Primary navigation"
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-control px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-surface-raised text-ink ring-1 ring-line/50"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "text-accent" : "text-muted"}
                  aria-hidden="true"
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-line/60 bg-surface-sunken/40 px-5 py-4">
          <p className="text-xs font-semibold text-muted">Evidence-led decisions</p>
          <p className="mt-1 text-xs text-faint">Feedback + behavior + AI</p>
        </div>
      </aside>
    </>
  );
}
