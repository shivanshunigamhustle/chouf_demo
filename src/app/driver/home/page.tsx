"use client";

import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { DriverScreen } from "@/components/layout/DriverChrome";
import { Card, CardBody, Select, EmptyState, Switch } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, timeAgo, formatDistance } from "@/lib/utils";
import { distanceBetween } from "@/lib/fees";
import { Wallet, PackageCheck, Power, Navigation, Inbox } from "lucide-react";

export default function DriverHome() {
  const { t, locale } = useT();
  const drivers = useChoufStore((s) => s.drivers);
  const activeDriverId = useChoufStore((s) => s.activeDriverId);
  const setActiveDriver = useChoufStore((s) => s.setActiveDriver);
  const setDriverStatus = useChoufStore((s) => s.setDriverStatus);
  const assignDriver = useChoufStore((s) => s.assignDriver);
  const driver = drivers.find((d) => d.id === activeDriverId)!;
  const merchants = useChoufStore((s) => s.merchants);

  const assigned = useChoufStore(
    useShallow((s) =>
      s.orders.filter((o) => o.driverId === activeDriverId && !["delivered", "cancelled", "rejected"].includes(o.status))
    )
  );
  const available = useChoufStore(
    useShallow((s) => s.orders.filter((o) => o.status === "ready" && !o.driverId))
  );

  const isOnline = driver.status !== "inactive";

  return (
    <DriverScreen>
      <div className="flex flex-col gap-4 p-4">
        <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-700 text-white">
          <CardBody className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">Demo: switch driver</p>
                <Select
                  value={activeDriverId}
                  onChange={(e) => setActiveDriver(e.target.value)}
                  className="mt-1 border-white/20 bg-white/10 text-white"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id} className="text-ink-900">
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-3.5">
              <div className="flex items-center gap-2">
                <Power className="h-4.5 w-4.5" />
                <span className="text-sm font-bold">{isOnline ? t("driver.goOffline") : t("driver.goOnline")}</span>
              </div>
              <Switch
                checked={isOnline}
                onChange={(v) => setDriverStatus(driver.id, v ? "active" : "inactive")}
                onColorClassName="bg-white"
                offColorClassName="bg-white/20"
                knobClassName={isOnline ? "bg-teal-600" : "bg-white"}
              />
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardBody className="pt-4">
              <Wallet className="h-4.5 w-4.5 text-teal-600" />
              <p className="mt-1.5 text-lg font-black text-ink-900">{formatCurrency(driver.todayEarnings, locale)}</p>
              <p className="text-xs text-ink-400">{t("driver.earningsToday")}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="pt-4">
              <PackageCheck className="h-4.5 w-4.5 text-teal-600" />
              <p className="mt-1.5 text-lg font-black text-ink-900">{driver.totalDeliveries}</p>
              <p className="text-xs text-ink-400">Lifetime deliveries</p>
            </CardBody>
          </Card>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">{t("driver.assigned")}</p>
          <div className="flex flex-col gap-2">
            {assigned.length === 0 && <EmptyState icon={<Navigation className="h-8 w-8" />} title="No active deliveries" />}
            {assigned.map((o) => {
              const merchant = merchants.find((m) => m.id === o.merchantId);
              return (
                <Link key={o.id} href={`/driver/delivery/${o.id}`}>
                  <Card>
                    <CardBody className="pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-ink-900">{o.code}</p>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="mt-1 text-xs text-ink-500">{locale === "ar" ? merchant?.nameAr : merchant?.name}</p>
                      <p className="text-xs text-ink-400">{formatDistance(o.distanceKm)} · {timeAgo(o.updatedAt, locale)}</p>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {isOnline && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
              <Inbox className="h-3.5 w-3.5" /> Available nearby
            </p>
            <div className="flex flex-col gap-2">
              {available.length === 0 && <p className="text-xs text-ink-400">No orders waiting for pickup right now.</p>}
              {available.map((o) => {
                const merchant = merchants.find((m) => m.id === o.merchantId);
                const dist = merchant ? distanceBetween(driver.location, merchant.location) : 0;
                return (
                  <Card key={o.id}>
                    <CardBody className="flex items-center justify-between pt-4">
                      <div>
                        <p className="text-sm font-bold text-ink-900">{o.code}</p>
                        <p className="text-xs text-ink-500">{locale === "ar" ? merchant?.nameAr : merchant?.name} · {formatDistance(dist)} away</p>
                      </div>
                      <Button size="sm" onClick={() => assignDriver(o.id, driver.id)}>
                        Accept
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DriverScreen>
  );
}
