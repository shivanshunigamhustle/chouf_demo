"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function BarChart({
  data,
  height = 200,
  formatValue = (v: number) => String(v),
  gradientFrom = "#ff5a1f",
  gradientTo = "#ffa374",
  className,
}: {
  data: { label: string; value: number }[];
  height?: number;
  formatValue?: (v: number) => string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const max = Math.max(...data.map((d) => d.value), 1);
  const gridLines = [1, 0.75, 0.5, 0.25, 0];
  const gradientId = `barGrad-${gradientFrom.replace("#", "")}`;

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {/* gridlines */}
      <div className="absolute inset-0 flex flex-col justify-between pb-6">
        {gridLines.map((g) => (
          <div key={g} className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-right text-[10px] font-medium text-ink-300">{formatValue(Math.round(max * g))}</span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
        ))}
      </div>

      {/* bars */}
      <div className="absolute inset-0 flex items-end gap-2.5 pb-6 pl-11 pr-1">
        {data.map((d, i) => {
          const pct = d.value / max;
          const targetHeight = Math.max(3, pct * (height - 24));
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && (
                <div className="absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-pop">
                  {formatValue(d.value)}
                  <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-ink-900" />
                </div>
              )}
              <svg width="100%" height={targetHeight} className="overflow-visible" style={{ transition: "height 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
                <defs>
                  <linearGradient id={`${gradientId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradientTo} />
                    <stop offset="100%" stopColor={gradientFrom} />
                  </linearGradient>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height={mounted ? targetHeight : 0}
                  rx="7"
                  fill={`url(#${gradientId}-${i})`}
                  className="transition-all duration-700 ease-out"
                  style={{ opacity: hover === null || hover === i ? 1 : 0.45 }}
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* x labels */}
      <div className="absolute inset-x-0 bottom-0 flex gap-2.5 pl-11 pr-1">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[11px] font-semibold text-ink-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
