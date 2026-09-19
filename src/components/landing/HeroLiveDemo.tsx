"use client";

import { useEffect, useMemo, useState } from "react";
import { useChoufStore } from "@/lib/store";
import { SimMap } from "@/components/map/SimMap";
import { Avatar } from "@/components/ui/Primitives";
import { lerpPoint, formatEta } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";
import { CheckCircle2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const CYCLE_STATUSES: { at: number; status: OrderStatus }[] = [
  { at: 0, status: "picked_up" },
  { at: 0.04, status: "on_the_way" },
  { at: 1, status: "delivered" },
];

function statusAt(progress: number): OrderStatus {
  let current: OrderStatus = "picked_up";
  for (const step of CYCLE_STATUSES) {
    if (progress >= step.at) current = step.status;
  }
  return current;
}

export function HeroLiveDemo() {
  const merchants = useChoufStore((s) => s.merchants);
  const zones = useChoufStore((s) => s.zones);
  const drivers = useChoufStore((s) => s.drivers);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const merchant = merchants[0];
  const driver = drivers[1] ?? drivers[0];
  const destination = useMemo(() => {
    const z = zones.find((z) => z.id !== merchant?.zoneId) ?? zones[0];
    return z?.center ?? { lat: 25.19, lng: 55.27 };
  }, [zones, merchant]);

  useEffect(() => {
    if (!merchant) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (paused) return p;
        const next = p + 0.006;
        if (next >= 1.05) {
          setPaused(true);
          setTimeout(() => {
            setProgress(0);
            setPaused(false);
          }, 1400);
          return 1;
        }
        return next;
      });
    }, 110);
    return () => clearInterval(id);
  }, [merchant, paused]);

  if (!merchant) return null;

  const clamped = Math.min(1, progress);
  const status = statusAt(clamped);
  const driverLocation = lerpPoint(merchant.location, destination, clamped);
  const etaMin = Math.max(0, Math.round((1 - clamped) * 22));

  const demoOrder: Order = {
    id: "demo-order",
    code: "CHF-2049",
    customerId: "demo-customer",
    merchantId: merchant.id,
    driverId: driver?.id ?? null,
    addressId: "demo-address",
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    paymentMethod: "cod",
    status,
    statusHistory: [],
    distanceKm: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDeliveryAt: new Date().toISOString(),
    driverRouteProgress: clamped,
    driverLocation,
  };

  const statusLabel = status === "delivered" ? "Delivered" : status === "picked_up" ? "Picked up" : "On the way";

  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/40 via-teal-200/30 to-violet-200/40 blur-2xl" />
      <div className="animate-fade-in-up overflow-hidden rounded-[1.75rem] border border-ink-100 bg-white shadow-pop [animation-delay:200ms]">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-danger-500">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE DEMO
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors duration-500",
              status === "delivered" ? "bg-success-50 text-success-600" : "bg-brand-50 text-brand-600"
            )}
          >
            {status === "delivered" && <CheckCircle2 className="h-3.5 w-3.5" />}
            {statusLabel}
          </span>
        </div>

        <SimMap
          zones={zones}
          height={230}
          showZoneLabels={false}
          trackingOrder={{ order: demoOrder, merchant, destination }}
          className="rounded-none border-0"
        />

        <div className="flex items-center gap-3 px-5 py-4">
          {driver && <Avatar name={driver.name} color={driver.avatarColor} size={38} />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-900">{driver?.name ?? "Driver"}</p>
            <p className="text-xs text-ink-400">{merchant.name} → Customer</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-ink-900">{status === "delivered" ? "Arrived" : formatEta(etaMin)}</p>
            <p className="text-[11px] text-ink-400">ETA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
