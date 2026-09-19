"use client";

import { use, useEffect, useState } from "react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusTimeline } from "@/components/ui/StatusTimeline";
import { SimMap } from "@/components/map/SimMap";
import { Card, CardBody, Textarea } from "@/components/ui/Primitives";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Primitives";
import { formatCurrency, formatEta } from "@/lib/utils";
import { Phone, MessageCircle } from "lucide-react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderDetail id={id} />;
}

export function OrderDetail({ id }: { id: string }) {
  const { t, locale } = useT();
  const order = useChoufStore((s) => s.orders.find((o) => o.id === id));
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === order?.merchantId));
  const customer = useChoufStore((s) => s.customers.find((c) => c.id === order?.customerId));
  const driver = useChoufStore((s) => s.drivers.find((d) => d.id === order?.driverId));
  const zones = useChoufStore((s) => s.zones);
  const rateOrder = useChoufStore((s) => s.rateOrder);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial client-only "now" read, then ticks on an interval
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);
  const [stars, setStars] = useState(5);
  const [driverStars, setDriverStars] = useState(5);
  const [comment, setComment] = useState("");

  if (!order || !merchant || !customer) {
    return (
      <CustomerScreen title="Order" showBack>
        <p className="p-6 text-sm text-ink-500">Order not found.</p>
      </CustomerScreen>
    );
  }

  const address = customer.addresses.find((a) => a.id === order.addressId);
  const isLive = ["driver_assigned", "picked_up", "on_the_way"].includes(order.status);
  const needsRating = order.status === "delivered" && !order.rating;

  return (
    <CustomerScreen title={order.code} showBack>
      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} />
          {now !== null && order.status !== "delivered" && order.status !== "cancelled" && order.status !== "rejected" && (
            <span className="text-xs text-ink-400">ETA {formatEta((+new Date(order.estimatedDeliveryAt) - now) / 60000)}</span>
          )}
        </div>

        {isLive && address && (
          <SimMap
            zones={zones}
            height={260}
            trackingOrder={{ order, merchant, destination: address.location }}
            showZoneLabels={false}
          />
        )}

        {driver && isLive && (
          <Card>
            <CardBody className="flex items-center gap-3 pt-5">
              <Avatar name={driver.name} color={driver.avatarColor} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-900">{locale === "ar" ? driver.nameAr : driver.name}</p>
                <p className="text-xs text-ink-400">{driver.vehicle} · {driver.plate}</p>
              </div>
              <button className="rounded-full bg-ink-100 p-2.5 text-ink-600"><Phone className="h-4 w-4" /></button>
              <button className="rounded-full bg-ink-100 p-2.5 text-ink-600"><MessageCircle className="h-4 w-4" /></button>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="pt-5">
            <p className="mb-4 text-sm font-bold text-ink-900">Status</p>
            <StatusTimeline status={order.status} history={order.statusHistory} />
          </CardBody>
        </Card>

        {needsRating && (
          <Card>
            <CardBody className="pt-5">
              <p className="mb-3 text-sm font-bold text-ink-900">{t("customer.rateOrder")}</p>
              <p className="mb-1.5 text-xs text-ink-500">Food & merchant</p>
              <RatingStars value={stars} onChange={setStars} />
              {driver && (
                <>
                  <p className="mb-1.5 mt-3 text-xs text-ink-500">Driver — {driver.name}</p>
                  <RatingStars value={driverStars} onChange={setDriverStars} />
                </>
              )}
              <Textarea className="mt-3" rows={3} placeholder="Add a comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button className="mt-3 w-full" onClick={() => rateOrder(order.id, stars, comment, driver ? driverStars : undefined)}>
                {t("common.submit")}
              </Button>
            </CardBody>
          </Card>
        )}

        {order.rating && (
          <Card>
            <CardBody className="pt-5">
              <p className="mb-2 text-sm font-bold text-ink-900">Your rating</p>
              <RatingStars value={order.rating.stars} readOnly />
              {order.rating.comment && <p className="mt-2 text-xs text-ink-500">&ldquo;{order.rating.comment}&rdquo;</p>}
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="pt-5">
            <p className="mb-3 text-sm font-bold text-ink-900">Order details</p>
            <div className="flex flex-col gap-2 text-xs">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-ink-600">{it.quantity}× {locale === "ar" ? it.nameAr : it.name}</span>
                  <span className="font-semibold text-ink-800">{formatCurrency(it.price * it.quantity, locale)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-ink-100 pt-2 text-ink-500">
                <span>{t("common.subtotal")}</span><span>{formatCurrency(order.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>{t("common.deliveryFee")}</span><span>{formatCurrency(order.deliveryFee, locale)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>{t("common.discount")}</span><span>-{formatCurrency(order.discount, locale)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink-100 pt-2 text-sm font-bold text-ink-900">
                <span>{t("common.total")}</span><span>{formatCurrency(order.total, locale)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-400">Delivering to {address?.label} · {address?.line1}</p>
          </CardBody>
        </Card>
      </div>
    </CustomerScreen>
  );
}
