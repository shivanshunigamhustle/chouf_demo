"use client";

import Link from "next/link";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SimMap } from "@/components/map/SimMap";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Receipt, Bike, Wallet, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { t, locale } = useT();
  const orders = useChoufStore((s) => s.orders);
  const drivers = useChoufStore((s) => s.drivers);
  const merchants = useChoufStore((s) => s.merchants);
  const zones = useChoufStore((s) => s.zones);

  const today = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const gmv = today.filter((o) => !["cancelled", "rejected"].includes(o.status)).reduce((s, o) => s + o.total, 0);
  const activeDrivers = drivers.filter((d) => d.status !== "inactive").length;
  const live = orders.filter((o) => ["driver_assigned", "picked_up", "on_the_way"].includes(o.status));
  const recent = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-black text-ink-900">{t("admin.liveOperations")}</h1>
        <p className="text-sm text-ink-400">Real-time snapshot across every zone.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Receipt} label={t("admin.totalOrdersToday")} value={String(today.length)} tone="brand" delta={9} />
        <StatCard icon={Bike} label={t("admin.activeDrivers")} value={String(activeDrivers)} tone="teal" />
        <StatCard icon={Wallet} label={t("admin.gmvToday")} value={formatCurrency(gmv, locale)} tone="success" delta={14} />
        <StatCard icon={Clock} label="Orders in transit" value={String(live.length)} tone="info" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">{t("nav.liveMap")}</h2>
            <Link href="/admin/live-map" className="text-xs font-semibold text-brand-600">{t("common.viewAll")}</Link>
          </CardHeader>
          <CardBody className="pt-0">
            <SimMap zones={zones} drivers={drivers} merchants={merchants} height={340} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="text-sm font-bold text-ink-900">Fleet status</h2></CardHeader>
          <CardBody className="flex flex-col gap-3 pt-0">
            {["active", "on_delivery", "inactive"].map((status) => {
              const count = drivers.filter((d) => d.status === status).length;
              const pct = Math.round((count / drivers.length) * 100);
              const colors: Record<string, string> = { active: "bg-success-500", on_delivery: "bg-teal-500", inactive: "bg-ink-300" };
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-xs font-semibold text-ink-600">
                    <span className="capitalize">{status.replace("_", " ")}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                    <div className={`h-full rounded-full ${colors[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-900">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-brand-600">{t("common.viewAll")}</Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm rtl:text-right">
              <thead>
                <tr className="border-b border-ink-100 text-xs text-ink-400">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Merchant</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const merchant = merchants.find((m) => m.id === o.merchantId);
                  return (
                    <tr key={o.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                      <td className="px-4 py-3 font-bold text-ink-900">
                        <Link href={`/admin/orders/${o.id}`}>{o.code}</Link>
                      </td>
                      <td className="px-4 py-3 text-ink-600">{locale === "ar" ? merchant?.nameAr : merchant?.name}</td>
                      <td className="px-4 py-3 font-semibold text-ink-800">{formatCurrency(o.total, locale)}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 text-ink-400">{timeAgo(o.createdAt, locale)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
