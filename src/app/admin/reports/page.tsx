"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/Primitives";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Users, Star, Trophy } from "lucide-react";

const ZONE_COLORS = ["#ff5a1f", "#0ea5a4", "#2563eb", "#7c3aed"];

export default function AdminReports() {
  const orders = useChoufStore(useShallow((s) => s.orders.filter((o) => !["cancelled", "rejected"].includes(o.status))));
  const merchants = useChoufStore((s) => s.merchants);
  const customers = useChoufStore((s) => s.customers);
  const zones = useChoufStore((s) => s.zones);

  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => ({
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      value: orders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString()).reduce((s, o) => s + o.total, 0),
    }));
  }, [orders]);

  const byMerchant = useMemo(() => {
    return merchants
      .map((m) => ({ m, total: orders.filter((o) => o.merchantId === m.id).reduce((s, o) => s + o.total, 0), count: orders.filter((o) => o.merchantId === m.id).length }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [merchants, orders]);

  const byZone = useMemo(() => {
    return zones.map((z, i) => ({
      label: z.name,
      value: orders.filter((o) => merchants.find((m) => m.id === o.merchantId)?.zoneId === z.id).length,
      color: ZONE_COLORS[i % ZONE_COLORS.length],
    }));
  }, [zones, orders, merchants]);

  const totalGmv = orders.reduce((s, o) => s + o.total, 0);
  const maxMerchantTotal = byMerchant[0]?.total || 1;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-ink-900">Reports</h1>
        <p className="mt-1 text-sm text-ink-400">Platform-wide performance across every zone and merchant.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total GMV" value={formatCurrency(totalGmv, "en")} tone="success" delta={11} />
        <StatCard icon={ShoppingBag} label="Total orders" value={String(orders.length)} tone="brand" delta={7} />
        <StatCard icon={Users} label="Active customers" value={String(customers.length)} tone="info" />
        <StatCard icon={Star} label="Avg merchant rating" value={(merchants.reduce((s, m) => s + m.rating, 0) / merchants.length).toFixed(1)} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-bold text-ink-900">GMV — last 7 days</h2>
          </CardHeader>
          <CardBody className="pt-2">
            <BarChart data={last7} height={220} formatValue={(v) => formatCurrency(v, "en")} gradientFrom="#2563eb" gradientTo="#93c5fd" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold text-ink-900">Orders by zone</h2>
          </CardHeader>
          <CardBody className="flex items-center justify-center pt-2">
            <DonutChart data={byZone} centerValue={String(orders.length)} centerLabel="orders" />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
            <Trophy className="h-4 w-4 text-brand-500" /> Top merchants by GMV
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 pt-2">
          {byMerchant.map(({ m, total, count }, i) => (
            <div key={m.id} className="flex items-center gap-3">
              <span
                className={
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold " +
                  (i === 0 ? "bg-warning-50 text-warning-600" : "bg-ink-100 text-ink-500")
                }
              >
                {i + 1}
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white" style={{ backgroundColor: m.logoColor }}>
                {m.logoInitial}
              </span>
              <span className="w-36 shrink-0 truncate text-xs font-semibold text-ink-700">{m.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                  style={{ width: `${(total / maxMerchantTotal) * 100}%` }}
                />
              </div>
              <Badge tone="neutral" className="w-14 shrink-0 justify-center">{count} orders</Badge>
              <span className="w-20 shrink-0 text-right text-xs font-bold text-ink-900">{formatCurrency(total, "en")}</span>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
