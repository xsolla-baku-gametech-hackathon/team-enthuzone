import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import type { Issue } from "@/lib/types";
import { signed } from "@/lib/utils/format";

export function IssueCard({ issue }: { issue: Issue }) {