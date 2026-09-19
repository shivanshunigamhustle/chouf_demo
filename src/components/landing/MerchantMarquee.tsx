"use client";

import { useChoufStore } from "@/lib/store";

export function MerchantMarquee() {
  const merchants = useChoufStore((s) => s.merchants);
  const track = [...merchants, ...merchants];

  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-3">
        {track.map((m, i) => (
          <div
            key={`${m.id}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 shadow-card"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white"
              style={{ backgroundColor: m.logoColor }}
            >
              {m.logoInitial}
            </span>
            <span className="whitespace-nowrap text-xs font-semibold text-ink-600">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
