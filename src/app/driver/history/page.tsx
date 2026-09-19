"use client";

import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { DriverScreen } from "@/components/layout/DriverChrome";
import { Card, CardBody, EmptyState } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { History } from "lucide-react";

export default function DriverHistory() {
  const { t, locale } = useT();
  const activeDriverId = useChoufStore((s) => s.activeDriverId);
  const merchants = useChoufStore((s) => s.merchants);
  const orders = useChoufStore(
    useShallow((s) => s.orders.filter((o) => o.driverId === activeDriverId && ["delivered", "cancelled"].includes(o.status)))
  );
  const sorted = [...orders].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return (
    <DriverScreen title={t("nav.history")}>
      <div className="flex flex-col gap-3 p-4">
        {sorted.length === 0 && <EmptyState icon={<History className="h-8 w-8" />} title="No completed deliveries yet" />}
        {sorted.map((o) => {
          const merchant = merchants.find((m) => m.id === o.merchantId);
          return (
            <Card key={o.id}>
              <CardBody className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-ink-900">{o.code}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-xs text-ink-500">{locale === "ar" ? merchant?.nameAr : merchant?.name} · {timeAgo(o.updatedAt, locale)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-600">+{formatCurrency(o.deliveryFee * 0.7, locale)}</span>
                  {o.rating?.driverStars && <RatingStars value={o.rating.driverStars} readOnly size={14} />}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </DriverScreen>
  );
}
