"use client";

import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Badge, Avatar } from "@/components/ui/Primitives";
import { SimMap } from "@/components/map/SimMap";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDistance } from "@/lib/utils";
import { Store, Bike } from "lucide-react";

export default function MerchantLiveMap() {
  const { locale } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === activeMerchantId));
  const zones = useChoufStore((s) => s.zones);
  const allDrivers = useChoufStore((s) => s.drivers);

  const liveOrders = useChoufStore(
    useShallow((s) => s.orders.filter((o) => o.merchantId === activeMerchantId && ["driver_assigned", "picked_up", "on_the_way"].includes(o.status)))
  );

  const assignedDriverIds = new Set(liveOrders.map((o) => o.driverId).filter(Boolean));
  const zoneDrivers = allDrivers.filter((d) => d.zoneId === merchant?.zoneId);

  if (!merchant) return null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-ink-900">Live map</h1>
        <p className="mt-1 text-sm text-ink-400">
          {liveOrders.length} {liveOrders.length === 1 ? "delivery" : "deliveries"} in progress · {zoneDrivers.filter((d) => d.status === "active").length} drivers nearby
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardBody className="pt-4">
            <SimMap zones={zones} drivers={zoneDrivers} merchants={[merchant]} highlightMerchantId={merchant.id} height={480} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink-900">
              <Store className="h-4 w-4 text-brand-500" /> Your store
            </p>
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-ink-100 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black text-white" style={{ backgroundColor: merchant.logoColor }}>
                {merchant.logoInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-ink-900">{merchant.name}</p>
                <p className="truncate text-[11px] text-ink-400">{locale === "ar" ? merchant.addressAr : merchant.address}</p>
              </div>
            </div>

            <p className="mb-3 text-sm font-bold text-ink-900">Active deliveries</p>
            <div className="flex flex-col gap-2">
              {liveOrders.length === 0 && <p className="text-xs text-ink-400">No deliveries in progress right now.</p>}
              {liveOrders.map((o) => {
                const driver = allDrivers.find((d) => d.id === o.driverId);
                return (
                  <Link key={o.id} href={`/merchant/orders/${o.id}`} className="flex items-center gap-2 rounded-xl border border-ink-100 p-2.5 transition-colors hover:border-ink-200">
                    {driver ? <Avatar name={driver.name} color={driver.avatarColor} size={30} /> : <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-ink-100 text-ink-400"><Bike className="h-3.5 w-3.5" /></span>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-900">{o.code}</p>
                      <p className="truncate text-[11px] text-ink-400">{driver ? (locale === "ar" ? driver.nameAr : driver.name) : "Awaiting pickup"}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={o.status} />
                      <p className="mt-1 text-[10px] text-ink-400">{formatDistance(o.distanceKm * (1 - o.driverRouteProgress))}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <p className="mb-2 mt-5 text-sm font-bold text-ink-900">Drivers nearby</p>
            <div className="flex flex-col gap-2">
              {zoneDrivers.map((d) => (
                <div key={d.id} className="flex items-center gap-2 rounded-xl border border-ink-100 p-2">
                  <Avatar name={d.name} color={d.avatarColor} size={26} />
                  <span className="flex-1 truncate text-xs font-semibold text-ink-800">{locale === "ar" ? d.nameAr : d.name}</span>
                  <Badge tone={assignedDriverIds.has(d.id) ? "teal" : d.status === "active" ? "success" : "neutral"}>
                    {assignedDriverIds.has(d.id) ? "delivering for you" : d.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
