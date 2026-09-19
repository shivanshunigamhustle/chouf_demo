"use client";

import { useEffect, useRef, useState } from "react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationEvent } from "@/lib/types";

export function NotificationToasts({ audience, audienceId }: { audience: NotificationEvent["audience"]; audienceId?: string }) {
  const notifications = useChoufStore((s) => s.notifications);
  const { locale } = useT();
  const [visible, setVisible] = useState<NotificationEvent[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const mounted = useRef(false);

  useEffect(() => {
    // don't burst-toast the initial seeded/rehydrated list on mount
    if (!mounted.current) {
      notifications.forEach((n) => seen.current.add(n.id));
      mounted.current = true;
      return;
    }
    const relevant = notifications.filter(
      (n) => n.audience === audience && (!audienceId || !n.audienceId || n.audienceId === audienceId) && !seen.current.has(n.id)
    );
    relevant.forEach((n) => seen.current.add(n.id));
    if (relevant.length) {
      setVisible((v) => [...relevant, ...v].slice(0, 4));
      relevant.forEach((n) => {
        setTimeout(() => setVisible((v) => v.filter((x) => x.id !== n.id)), 5000);
      });
    }
  }, [notifications, audience, audienceId]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3">
      {visible.map((n) => (
        <div
          key={n.id}
          className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-ink-200 bg-white/95 p-3.5 shadow-pop backdrop-blur"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Bell className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{locale === "ar" ? n.titleAr : n.title}</p>
            <p className="truncate text-xs text-ink-500">{locale === "ar" ? n.bodyAr : n.body}</p>
          </div>
          <button
            onClick={() => setVisible((v) => v.filter((x) => x.id !== n.id))}
            className={cn("text-ink-300 hover:text-ink-500")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
