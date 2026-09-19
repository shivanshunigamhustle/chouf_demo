"use client";

import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Receipt, Wallet, Star, PackageX, Inbox } from "lucide-react";

export default function MerchantDashboard() {
  const { t, locale } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === activeMerchantId));
  const orders = useChoufStore(useShallow((s) => s.orders.filter((o) => o.merchantId === activeMerchantId)));
  const advanceOrder = useChoufStore((s) => s.advanceOrder);
  const rejectOrder = useChoufStore((s) => s.rejectOrder);

  const today = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const revenue = today.filter((o) => o.status !== "cancelled" && o.status !== "rejected").reduce((s, o) => s + o.subtotal, 0);
  const incoming = orders.filter((o) => o.status === "placed").sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const unavailableCount = useChoufStore((s) => s.products.filter((p) => p.merchantId === activeMerchantId && !p.available).length);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-ink-900">{locale === "ar" ? merchant?.nameAr : merchant?.name}</h1>
          <p className="text-sm text-ink-400">{t("admin.liveOperations")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Receipt} label="Orders today" value={String(today.length)} tone="brand" delta={12} />
        <StatCard icon={Wallet} label={t("merchant.todayRevenue")} value={formatCurrency(revenue, locale)} tone="success" delta={8} />
        <StatCard icon={Star} label="Rating" value={merchant?.rating.toFixed(1) ?? "-"} tone="warning" />
        <StatCard icon={PackageX} label="Unavailable items" value={String(unavailableCount)} tone="info" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900"><Inbox className="h-4 w-4 text-brand-500" /> {t("merchant.newOrders")}</h2>
          <Link href="/merchant/orders" className="text-xs font-semibold text-brand-600">{t("common.viewAll")}</Link>
        </CardHeader>
        <CardBody>
          {incoming.length === 0 ? (
            <EmptyState icon={<Inbox className="h-8 w-8" />} title="No new orders right now" />
          ) : (
            <div className="flex flex-col divide-y divide-ink-100">
              {incoming.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-bold text-ink-900">{o.code} <span className="ml-2"><StatusBadge status={o.status} /></span></p>
                    <p className="mt-1 text-xs text-ink-400">{o.items.length} items · {formatCurrency(o.total, locale)} · {timeAgo(o.createdAt, locale)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => rejectOrder(o.id, "Unable to fulfill")}>{t("merchant.rejectOrder")}</Button>
                    <Button size="sm" onClick={() => advanceOrder(o.id)}>{t("merchant.acceptOrder")}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
