"use client";

import { use } from "react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Avatar } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusTimeline } from "@/components/ui/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export default function MerchantOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useT();
  const order = useChoufStore((s) => s.orders.find((o) => o.id === id));
  const customer = useChoufStore((s) => s.customers.find((c) => c.id === order?.customerId));
  const driver = useChoufStore((s) => s.drivers.find((d) => d.id === order?.driverId));
  const advanceOrder = useChoufStore((s) => s.advanceOrder);
  const rejectOrder = useChoufStore((s) => s.rejectOrder);

  if (!order || !customer) return <p className="text-sm text-ink-500">Order not found.</p>;
  const address = customer.addresses.find((a) => a.id === order.addressId);

  const actionMap: Record<string, { label: string; fn: () => void }> = {
    placed: { label: t("merchant.acceptOrder"), fn: () => advanceOrder(order.id) },
    accepted: { label: t("merchant.markPreparing"), fn: () => advanceOrder(order.id) },
    preparing: { label: t("merchant.markReady"), fn: () => advanceOrder(order.id) },
  };
  const action = actionMap[order.status];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-ink-900">{order.code}</h1>
          <StatusBadge status={order.status} />
        </div>

        <Card>
          <CardBody className="pt-5">
            <p className="mb-3 text-sm font-bold text-ink-900">Items</p>
            <div className="flex flex-col gap-2 text-sm">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-ink-600">{it.quantity}× {locale === "ar" ? it.nameAr : it.name}</span>
                  <span className="font-semibold text-ink-800">{formatCurrency(it.price * it.quantity, locale)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-ink-100 pt-2 text-ink-500">
                <span>{t("common.subtotal")}</span><span>{formatCurrency(order.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between font-bold text-ink-900">
                <span>{t("common.total")}</span><span>{formatCurrency(order.total, locale)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <p className="mb-4 text-sm font-bold text-ink-900">Status timeline</p>
            <StatusTimeline status={order.status} history={order.statusHistory} />
          </CardBody>
        </Card>

        {action && (
          <div className="flex gap-2">
            <Button onClick={action.fn}>{action.label}</Button>
            {order.status === "placed" && (
              <Button variant="outline" onClick={() => rejectOrder(order.id, "Unable to fulfill")}>{t("merchant.rejectOrder")}</Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardBody className="flex items-center gap-3 pt-5">
            <Avatar name={customer.name} color={customer.avatarColor} />
            <div>
              <p className="text-sm font-bold text-ink-900">{locale === "ar" ? customer.nameAr : customer.name}</p>
              <p className="text-xs text-ink-400">{customer.phone}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-400">Delivery address</p>
            <p className="text-sm text-ink-800">{address?.label} — {address?.line1}</p>
          </CardBody>
        </Card>
        {driver && (
          <Card>
            <CardBody className="flex items-center gap-3 pt-5">
              <Avatar name={driver.name} color={driver.avatarColor} />
              <div>
                <p className="text-sm font-bold text-ink-900">{locale === "ar" ? driver.nameAr : driver.name}</p>
                <p className="text-xs text-ink-400">{driver.vehicle} · {driver.plate}</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
