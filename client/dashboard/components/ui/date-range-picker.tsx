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