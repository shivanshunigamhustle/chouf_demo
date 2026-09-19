"use client";

import { use } from "react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, CardHeader, Avatar, Select } from "@/components/ui/Primitives";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusTimeline } from "@/components/ui/StatusTimeline";
import { SimMap } from "@/components/map/SimMap";
import { DemoControl } from "@/components/admin/DemoControl";
import { LiveDeviceView } from "@/components/admin/LiveDeviceView";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale } = useT();
  const order = useChoufStore((s) => s.orders.find((o) => o.id === id));
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === order?.merchantId));
  const customer = useChoufStore((s) => s.customers.find((c) => c.id === order?.customerId));
  const drivers = useChoufStore((s) => s.drivers);
  const driver = useChoufStore((s) => s.drivers.find((d) => d.id === order?.driverId));
  const zones = useChoufStore((s) => s.zones);
  const assignDriver = useChoufStore((s) => s.assignDriver);

  if (!order || !merchant || !customer) return <p className="text-sm text-ink-500">Order not found.</p>;
  const address = customer.addresses.find((a) => a.id === order.addressId);
  const isLive = ["driver_assigned", "picked_up", "on_the_way"].includes(order.status);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-ink-900">{order.code}</h1>
          <p className="text-sm text-ink-400">{locale === "ar" ? merchant.nameAr : merchant.name} → {locale === "ar" ? customer.nameAr : customer.name}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <DemoControl orderId={order.id} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {isLive && address && (
            <Card>
              <CardHeader><h2 className="text-sm font-bold text-ink-900">Live tracking</h2></CardHeader>
              <CardBody className="pt-0">
                <SimMap zones={zones} height={300} trackingOrder={{ order, merchant, destination: address.location }} showZoneLabels={false} />
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader><h2 className="text-sm font-bold text-ink-900">Status timeline</h2></CardHeader>
            <CardBody className="pt-0"><StatusTimeline status={order.status} history={order.statusHistory} /></CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="text-sm font-bold text-ink-900">Items</h2></CardHeader>
            <CardBody className="pt-0">
              <div className="flex flex-col gap-2 text-sm">
                {order.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-ink-600">{it.quantity}× {locale === "ar" ? it.nameAr : it.name}</span>
                    <span className="font-semibold text-ink-800">{formatCurrency(it.price * it.quantity, locale)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-ink-100 pt-2 font-bold text-ink-900">
                  <span>{t("common.total")}</span><span>{formatCurrency(order.total, locale)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
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
          <Card>
            <CardBody className="pt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Driver</p>
              {driver && (
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={driver.name} color={driver.avatarColor} />
                  <div>
                    <p className="text-sm font-bold text-ink-900">{locale === "ar" ? driver.nameAr : driver.name}</p>
                    <p className="text-xs text-ink-400">{driver.vehicle} · {driver.plate}</p>
                  </div>
                </div>
              )}
              <label className="mb-1 block text-xs font-semibold text-ink-500">{driver ? "Reassign driver" : "Assign driver"}</label>
              <Select value={order.driverId ?? ""} onChange={(e) => e.target.value && assignDriver(order.id, e.target.value)}>
                <option value="">— Select driver —</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                ))}
              </Select>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><h2 className="text-sm font-bold text-ink-900">Live view</h2></CardHeader>
        <CardBody className="pt-2">
          <LiveDeviceView orderId={order.id} />
        </CardBody>
      </Card>
    </div>
  );
}
