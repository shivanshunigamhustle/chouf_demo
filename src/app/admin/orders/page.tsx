"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { Search } from "lucide-react";

const FILTERS: (OrderStatus | "all")[] = ["all", "placed", "accepted", "preparing", "ready", "driver_assigned", "picked_up", "on_the_way", "delivered", "cancelled", "rejected"];

export default function AdminOrders() {
  const { t, locale } = useT();
  const orders = useChoufStore((s) => s.orders);
  const merchants = useChoufStore((s) => s.merchants);
  const customers = useChoufStore((s) => s.customers);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
    if (query.trim()) list = list.filter((o) => o.code.toLowerCase().includes(query.toLowerCase()));
    return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, filter, query]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-black text-ink-900">{t("nav.orders")}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 sm:w-64">
          <Search className="h-4 w-4 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order code" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === f ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 bg-white text-ink-600"
              )}
            >
              {f === "all" ? "All" : t(`status.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm rtl:text-right">
              <thead>
                <tr className="border-b border-ink-100 text-xs text-ink-400">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Merchant</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 60).map((o) => {
                  const merchant = merchants.find((m) => m.id === o.merchantId);
                  const customer = customers.find((c) => c.id === o.customerId);
                  return (
                    <tr key={o.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                      <td className="px-4 py-3 font-bold text-ink-900"><Link href={`/admin/orders/${o.id}`}>{o.code}</Link></td>
                      <td className="px-4 py-3 text-ink-600">{locale === "ar" ? customer?.nameAr : customer?.name}</td>
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
