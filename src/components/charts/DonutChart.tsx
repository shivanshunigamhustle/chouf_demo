"use client";

import { useEffect, useState } from "react";

export function DonutChart({
  data,
  size = 160,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const offsets: number[] = [];
  data.reduce((acc, d) => {
    offsets.push(acc);
    return acc + (d.value / total) * circumference;
  }, 0);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef2" strokeWidth={thickness} />
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = mounted ? frac * circumference : 0;
            const gap = circumference - dash;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offsets[i]}
                strokeLinecap="butt"
                style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)", transitionDelay: `${i * 90}ms` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-ink-900">{centerValue}</span>
          {centerLabel && <span className="text-[11px] font-medium text-ink-400">{centerLabel}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="flex-1 truncate font-medium text-ink-600">{d.label}</span>
            <span className="font-bold text-ink-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
