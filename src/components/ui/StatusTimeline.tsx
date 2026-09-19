"use client";

import { useT } from "@/lib/i18n/useT";
import { cn, timeAgo } from "@/lib/utils";
import { ORDER_STATUS_FLOW, type OrderStatus, type StatusEvent } from "@/lib/types";
import { Check } from "lucide-react";

export function StatusTimeline({ status, history }: { status: OrderStatus; history: StatusEvent[] }) {
  const { t, locale } = useT();
  const isTerminalBad = status === "cancelled" || status === "rejected";
  const currentIdx = ORDER_STATUS_FLOW.indexOf(status);

  if (isTerminalBad) {
    return (
      <div className="rounded-2xl border border-danger-500/20 bg-danger-50 p-4">
        <p className="text-sm font-semibold text-danger-600">{t(`status.${status}`)}</p>
        {history.at(-1)?.note && <p className="mt-1 text-xs text-danger-500">{history.at(-1)?.note}</p>}
      </div>
    );
  }

  return (
    <ol className="relative">
      {ORDER_STATUS_FLOW.map((s, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const event = history.find((h) => h.status === s);
        return (
          <li key={s} className="relative flex gap-3 pb-6 last:pb-0">
            {i < ORDER_STATUS_FLOW.length - 1 && (
              <span
                className={cn(
                  "absolute top-6 h-full w-0.5 rtl:right-[11px] ltr:left-[11px]",
                  done ? "bg-brand-400" : "bg-ink-200"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                done ? "border-brand-500 bg-brand-500 text-white" : "border-ink-300 bg-white text-transparent",
                isCurrent && "ring-4 ring-brand-100"
              )}
            >
              <Check className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1 pt-0.5">
              <p className={cn("text-sm font-semibold", done ? "text-ink-900" : "text-ink-400")}>{t(`status.${s}`)}</p>
              {event && <p className="text-xs text-ink-400">{timeAgo(event.at, locale)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
