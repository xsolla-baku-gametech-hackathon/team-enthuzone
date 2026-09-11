"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const controls = [
  { key: "category", label: "Category", values: ["ALL", "GAMEPLAY_BALANCE", "ECONOMY", "MATCHMAKING", "ONBOARDING", "AUDIO"] },
  { key: "priority", label: "Priority", values: ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] },
  { key: "status", label: "Status", values: ["ALL", "OPEN", "INVESTIGATING", "VALIDATING", "RESOLVED"] },
  { key: "build", label: "Build", values: ["ALL", "1.8.0", "1.7.9"] },
  { key: "sort", label: "Sort by", values: ["priorityScore", "feedbackGrowth", "confidence"] },
];

export function IssueFilters() {
  const router = useRouter(); const pathname = usePathname(); const search = useSearchParams();
  function update(key: string, value: string) { const params = new URLSearchParams(search.toString()); if (value === "ALL") params.delete(key); else params.set(key, value); router.replace(`${pathname}?${params.toString()}`); }
  return <div className="flex flex-wrap items-end gap-3 rounded-panel bg-surface p-4">{controls.map((control) => <label key={control.key} className="grid gap-1.5"><span className="text-xs font-semibold text-muted">{control.label}</span><Select value={search.get(control.key) ?? (control.key === "sort" ? "priorityScore" : "ALL")} onChange={(event) => update(control.key, event.target.value)}>{control.values.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</Select></label>)}<Button onClick={() => router.replace(pathname)} className="ml-auto"><RotateCcw size={15} />Clear filters</Button></div>;
}
