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