"use client";

import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/Primitives";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Receipt } from "lucide-react";

export default function OrderHistory() {
  const { t, locale } = useT();
  const orders = useChoufStore(useShallow((s) => s.orders.filter((o) => o.customerId === s.activeCustomerId)));
  const merchants = useChoufStore((s) => s.merchants);
  const sorted = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <CustomerScreen title={t("customer.orderHistory")}>
      <div className="flex flex-col gap-3 p-4">
        {sorted.length === 0 && <EmptyState icon={<Receipt className="h-10 w-10" />} title="No orders yet" />}
        {sorted.map((o) => {
          const merchant = merchants.find((m) => m.id === o.merchantId);
          return (
            <Link
              key={o.id}
              href={`/customer/orders/${o.id}`}
              className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3 shadow-card"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
                style={{ backgroundColor: merchant?.logoColor }}
              >
                {merchant?.logoInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-bold text-ink-900">{locale === "ar" ? merchant?.nameAr : merchant?.name}</p>
                  <span className="text-xs font-bold text-ink-900">{formatCurrency(o.total, locale)}</span>
                </div>
                <p className="text-xs text-ink-400">{o.code} · {timeAgo(o.createdAt, locale)}</p>
                <div className="mt-1.5">
                  <StatusBadge status={o.status} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </CustomerScreen>
  );
}
