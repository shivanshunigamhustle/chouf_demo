"use client";

import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Badge, Avatar } from "@/components/ui/Primitives";
import { SimMap } from "@/components/map/SimMap";
import { formatDistance } from "@/lib/utils";
import Link from "next/link";

export default function AdminLiveMap() {
  const { locale } = useT();
  const drivers = useChoufStore((s) => s.drivers);
  const merchants = useChoufStore((s) => s.merchants);
  const zones = useChoufStore((s) => s.zones);
  const liveOrders = useChoufStore(useShallow((s) => s.orders.filter((o) => ["driver_assigned", "picked_up", "on_the_way"].includes(o.status))));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-ink-900">Live map</h1>
        <p className="text-sm text-ink-400">{drivers.filter((d) => d.status !== "inactive").length} drivers online · {liveOrders.length} deliveries in progress</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardBody className="pt-4">
            <SimMap zones={zones} drivers={drivers} merchants={merchants} height={520} />
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success-500" /> Active driver</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> On delivery</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ink-300" /> Offline</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-brand-500 bg-white" /> Merchant</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-4">
            <p className="mb-3 text-sm font-bold text-ink-900">In-transit orders</p>
            <div className="flex flex-col gap-2">
              {liveOrders.length === 0 && <p className="text-xs text-ink-400">No deliveries in progress.</p>}
              {liveOrders.map((o) => {
                const driver = drivers.find((d) => d.id === o.driverId);
                return (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-2 rounded-xl border border-ink-100 p-2.5">
                    {driver && <Avatar name={driver.name} color={driver.avatarColor} size={30} />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-900">{o.code}</p>
                      <p className="truncate text-[11px] text-ink-400">{driver ? (locale === "ar" ? driver.nameAr : driver.name) : "Unassigned"}</p>
                    </div>
                    <Badge tone="teal">{formatDistance(o.distanceKm * (1 - o.driverRouteProgress))}</Badge>
                  </Link>
                );
              })}
            </div>

            <p className="mb-2 mt-5 text-sm font-bold text-ink-900">Driver roster</p>
            <div className="flex flex-col gap-2">
              {drivers.map((d) => (
                <div key={d.id} className="flex items-center gap-2 rounded-xl border border-ink-100 p-2">
                  <Avatar name={d.name} color={d.avatarColor} size={26} />
                  <span className="flex-1 truncate text-xs font-semibold text-ink-800">{locale === "ar" ? d.nameAr : d.name}</span>
                  <Badge tone={d.status === "active" ? "success" : d.status === "on_delivery" ? "teal" : "neutral"}>{d.status.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
