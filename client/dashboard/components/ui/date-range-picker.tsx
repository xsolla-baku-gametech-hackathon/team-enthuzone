"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ranges = [{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "all", label: "All time" }];

export function DateRangePicker() {