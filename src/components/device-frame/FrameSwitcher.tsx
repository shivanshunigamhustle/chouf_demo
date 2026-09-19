"use client";

import { cn } from "@/lib/utils";
import type { FrameVariant } from "./DeviceFrame";
import { Smartphone } from "lucide-react";

export function FrameSwitcher({ value, onChange }: { value: FrameVariant; onChange: (v: FrameVariant) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white p-1 shadow-card">
      {(["ios", "android"] as FrameVariant[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            value === v ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100"
          )}
        >
          <Smartphone className="h-3.5 w-3.5" />
          {v === "ios" ? "iOS" : "Android"}
        </button>
      ))}
    </div>
  );
}
