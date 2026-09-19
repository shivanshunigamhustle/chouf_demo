"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function RatingStars({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(null)}
          className={cn(!readOnly && "cursor-pointer")}
        >
          <Star
            width={size}
            height={size}
            className={i <= display ? "fill-warning-500 text-warning-500" : "fill-transparent text-ink-300"}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingBadge({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold text-ink-700", size === "sm" ? "text-xs" : "text-sm")}>
      <Star className="h-3.5 w-3.5 fill-warning-500 text-warning-500" />
      {rating.toFixed(1)}
      {count !== undefined && <span className="font-normal text-ink-400">({count})</span>}
    </span>
  );
}
