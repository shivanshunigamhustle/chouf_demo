"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, timeAgo } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "placed", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "on_the_way", label: "On the way" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MerchantOrders() {
  const { t, locale } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const orders = useChoufStore(useShallow((s) => s.orders.filter((o) => o.merchantId === activeMerchantId)));
  const advanceOrder = useChoufStore((s) => s.advanceOrder);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => {
    const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
    return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, filter]);

  const nextActionLabel: Partial<Record<OrderStatus, string>> = {
    accepted: t("merchant.markPreparing"),
    preparing: t("merchant.markReady"),
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-black text-ink-900">{t("nav.orders")}</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              filter === f.key ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 bg-white text-ink-600"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm rtl:text-right">
              <thead>
                <tr className="border-b border-ink-100 text-xs text-ink-400">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Placed</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-bold text-ink-900">
                      <Link href={`/merchant/orders/${o.id}`}>{o.code}</Link>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{o.items.length}</td>
                    <td className="px-4 py-3 font-semibold text-ink-800">{formatCurrency(o.total, locale)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-ink-400">{timeAgo(o.createdAt, locale)}</td>
                    <td className="px-4 py-3 text-right">
                      {nextActionLabel[o.status] && (
                        <Button size="sm" variant="outline" onClick={() => advanceOrder(o.id)}>{nextActionLabel[o.status]}</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
