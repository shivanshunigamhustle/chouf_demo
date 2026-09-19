"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/Primitives";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Star, Repeat, Flame } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  delivered: "#16a34a",
  on_the_way: "#ff5a1f",
  preparing: "#f59e0b",
  cancelled: "#dc2626",
};

export default function MerchantReports() {
  const { t, locale } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const allOrders = useChoufStore(useShallow((s) => s.orders.filter((o) => o.merchantId === activeMerchantId)));
  const orders = useMemo(() => allOrders.filter((o) => o.status !== "cancelled" && o.status !== "rejected"), [allOrders]);

  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => ({
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      value: orders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString()).reduce((s, o) => s + o.subtotal, 0),
    }));
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const groups: Record<string, number> = {};
    allOrders.forEach((o) => {
      const key = o.status === "cancelled" || o.status === "rejected" ? "cancelled" : o.status === "delivered" ? "delivered" : ["on_the_way", "picked_up", "driver_assigned", "ready"].includes(o.status) ? "on_the_way" : "preparing";
      groups[key] = (groups[key] ?? 0) + 1;
    });
    return Object.entries(groups).map(([label, value]) => ({ label: label.replace("_", " "), value, color: STATUS_COLORS[label] }));
  }, [allOrders]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => o.items.forEach((it) => counts.set(it.name, (counts.get(it.name) ?? 0) + it.quantity)));
    return Array.from(counts.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + o.subtotal, 0);
  const avgOrder = orders.length ? totalRevenue / orders.length : 0;
  const maxQty = Math.max(...topProducts.map((p) => p.qty), 1);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-ink-900">{t("nav.reports")}</h1>
        <p className="mt-1 text-sm text-ink-400">Performance overview for the last 7 days.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total revenue" value={formatCurrency(totalRevenue, locale)} tone="success" delta={15} />
        <StatCard icon={ShoppingBag} label="Total orders" value={String(orders.length)} tone="brand" delta={6} />
        <StatCard icon={Repeat} label="Avg order value" value={formatCurrency(avgOrder, locale)} tone="info" />
        <StatCard icon={Star} label="Rating" value="4.7" tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-bold text-ink-900">Revenue — last 7 days</h2>
          </CardHeader>
          <CardBody className="pt-2">
            <BarChart data={last7} height={220} formatValue={(v) => formatCurrency(v, locale)} gradientFrom="#ff5a1f" gradientTo="#ffc9aa" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold text-ink-900">Order outcomes</h2>
          </CardHeader>
          <CardBody className="flex items-center justify-center pt-2">
            <DonutChart data={statusBreakdown} centerValue={String(allOrders.length)} centerLabel="orders" />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
            <Flame className="h-4 w-4 text-brand-500" /> Best-selling items
          </h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 pt-2">
          {topProducts.length === 0 && <p className="text-xs text-ink-400">Not enough order data yet.</p>}
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-bold text-ink-500">{i + 1}</span>
              <span className="w-40 shrink-0 truncate text-xs font-semibold text-ink-700">{p.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                  style={{ width: `${(p.qty / maxQty) * 100}%` }}
                />
              </div>
              <Badge tone="brand" className="w-16 shrink-0 justify-center">{p.qty} sold</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
