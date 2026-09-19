"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { DriverScreen } from "@/components/layout/DriverChrome";
import { SimMap } from "@/components/map/SimMap";
import { Card, CardBody, Avatar, Textarea } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Store, MapPin, Phone, Camera, CheckCircle2 } from "lucide-react";

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DeliveryDetail id={id} />;
}

export function DeliveryDetail({ id }: { id: string }) {
  const router = useRouter();
  const { t, locale } = useT();
  const order = useChoufStore((s) => s.orders.find((o) => o.id === id));
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === order?.merchantId));
  const customer = useChoufStore((s) => s.customers.find((c) => c.id === order?.customerId));
  const zones = useChoufStore((s) => s.zones);
  const advanceOrder = useChoufStore((s) => s.advanceOrder);
  const [proofNote, setProofNote] = useState("");
  const [proofCaptured, setProofCaptured] = useState(false);

  if (!order || !merchant || !customer) {
    return (
      <DriverScreen title="Delivery" showBack>
        <p className="p-6 text-sm text-ink-500">Not found.</p>
      </DriverScreen>
    );
  }

  const address = customer.addresses.find((a) => a.id === order.addressId);
  const showMap = ["driver_assigned", "picked_up", "on_the_way"].includes(order.status);

  const primaryAction = () => {
    if (order.status === "on_the_way") {
      advanceOrder(order.id); // -> delivered
      router.push("/driver/home");
    } else {
      advanceOrder(order.id);
    }
  };

  return (
    <DriverScreen title={order.code} showBack noBottomNav>
      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="flex items-center justify-between">
          <StatusBadge status={order.status} />
          <span className="text-xs text-ink-400">{formatCurrency(order.deliveryFee * 0.7, locale)} earning</span>
        </div>

        {showMap && address && (
          <SimMap zones={zones} height={230} showZoneLabels={false} trackingOrder={{ order, merchant, destination: address.location }} />
        )}

        <Card>
          <CardBody className="flex flex-col gap-3 pt-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Store className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink-400">{t("driver.pickupFrom")}</p>
                <p className="text-sm font-bold text-ink-900">{locale === "ar" ? merchant.nameAr : merchant.name}</p>
                <p className="text-xs text-ink-400">{locale === "ar" ? merchant.addressAr : merchant.address}</p>
              </div>
            </div>
            <div className="h-px bg-ink-100" />
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-700">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink-400">{t("driver.dropOffAt")}</p>
                <p className="text-sm font-bold text-ink-900">{address?.label} — {customer.name}</p>
                <p className="text-xs text-ink-400">{address?.line1}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 pt-5">
            <Avatar name={customer.name} color={customer.avatarColor} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-900">{locale === "ar" ? customer.nameAr : customer.name}</p>
              <p className="text-xs text-ink-400">{customer.phone}</p>
            </div>
            <button className="rounded-full bg-ink-100 p-2.5 text-ink-600"><Phone className="h-4 w-4" /></button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <p className="mb-2 text-sm font-bold text-ink-900">Order items ({order.items.length})</p>
            <div className="flex flex-col gap-1.5 text-xs">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-ink-600">{it.quantity}× {locale === "ar" ? it.nameAr : it.name}</span>
                  <span className="font-semibold text-ink-800">{formatCurrency(it.price * it.quantity, locale)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 border-t border-ink-100 pt-2 text-xs font-bold text-ink-900">
              {order.paymentMethod === "cod" ? `Collect ${formatCurrency(order.total, locale)} (Cash)` : ""}
            </p>
          </CardBody>
        </Card>

        {order.status === "on_the_way" && (
          <Card>
            <CardBody className="pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink-900">
                <Camera className="h-4 w-4 text-brand-500" /> {t("driver.proofOfDelivery")}
              </p>
              <button
                onClick={() => setProofCaptured(true)}
                className={`flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed text-xs font-semibold ${proofCaptured ? "border-success-500 bg-success-50 text-success-600" : "border-ink-300 text-ink-400"}`}
              >
                {proofCaptured ? (
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Photo captured</span>
                ) : (
                  "Tap to simulate capturing photo"
                )}
              </button>
              <Textarea className="mt-2" placeholder="Delivery note (optional)" rows={2} value={proofNote} onChange={(e) => setProofNote(e.target.value)} />
            </CardBody>
          </Card>
        )}

        <div className="sticky bottom-0 mt-2 bg-ink-50 pb-2 pt-2">
          {order.status === "driver_assigned" && (
            <Button size="lg" className="w-full" onClick={primaryAction}>{t("driver.confirmPickup")}</Button>
          )}
          {order.status === "picked_up" && (
            <Button size="lg" className="w-full" variant="success" onClick={primaryAction}>{t("driver.startNavigation")}</Button>
          )}
          {order.status === "on_the_way" && (
            <Button size="lg" className="w-full" variant="success" disabled={!proofCaptured} onClick={primaryAction}>
              {t("driver.confirmDelivery")}
            </Button>
          )}
          {order.status === "delivered" && <p className="text-center text-sm font-semibold text-success-600">Delivered ✓</p>}
        </div>
      </div>
    </DriverScreen>
  );
}
