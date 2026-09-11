import { Headphones, MessageCircle, MessagesSquare, Store } from "lucide-react";
import type { FeedbackSource } from "@/lib/types";

const icons = { STEAM: Store, DISCORD: MessagesSquare, REDDIT: MessageCircle, SUPPORT: Headphones };

export function FeedbackSourceIcon({ source }: { source: FeedbackSource }) {
  const Icon = icons[source];
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted"><Icon size={14} aria-hidden="true" />{source.charAt(0) + source.slice(1).toLowerCase()}</span>;
}
