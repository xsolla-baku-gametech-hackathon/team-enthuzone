"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ranges = [{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "all", label: "All time" }];

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const active = search.get("range") ?? "7d";
  function setRange(value: string) {
    const params = new URLSearchParams(search.toString());
    params.set("range", value);
    router.replace(`${pathname}?${params.toString()}`);
  }
  return <div className="flex rounded-control bg-surface-sunken p-1" aria-label="Date range">
    {ranges.map((range) => <button key={range.value} onClick={() => setRange(range.value)} aria-pressed={active === range.value} className={`min-h-8 rounded-control px-2.5 text-xs font-semibold transition-colors ${active === range.value ? "bg-surface-raised text-ink" : "text-muted hover:text-ink"}`}>{range.label}</button>)}
  </div>;
}
