"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  GitCompareArrows,
  LayoutDashboard,
  MessageSquareText,
  RadioTower,
  ShieldAlert,
} from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/issues", label: "Issues", icon: ShieldAlert },
  { href: "/feedback", label: "Feedback", icon: MessageSquareText },
  { href: "/telemetry", label: "Telemetry", icon: Activity },
  { href: "/compare", label: "Compare builds", icon: GitCompareArrows },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <>
      {/* Mobile Top Navigation */}
      <aside className="sticky top-0 z-30 flex min-w-0 max-w-full flex-col border-b border-line bg-sidebar/95 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">