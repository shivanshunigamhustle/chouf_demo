"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, Input, Badge } from "@/components/ui/Primitives";
import { calcDeliveryFee, distanceBetween } from "@/lib/fees";
import { cn, formatCurrency, formatDistance } from "@/lib/utils";
import { MapPin, Wallet, Ticket, AlertTriangle, Check } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, locale } = useT();
  const cart = useChoufStore((s) => s.cart);
  const products = useChoufStore((s) => s.products);
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === s.cart.merchantId));
  const customer = useChoufStore((s) => s.customers.find((c) => c.id === s.activeCustomerId));
  const activeAddressId = useChoufStore((s) => s.activeAddressId);
  const setActiveAddress = useChoufStore((s) => s.setActiveAddress);
  const placeOrder = useChoufStore((s) => s.placeOrder);
  const promos = useChoufStore((s) => s.promos);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [placing, setPlacing] = useState(false);

  const address = customer?.addresses.find((a) => a.id === activeAddressId) ?? customer?.addresses[0];

  const lines = cart.lines.map((line) => {
    const product = products.find((p) => p.id === line.productId)!;
    const addOns = product.addOns.filter((a) => line.addOnIds.includes(a.id));
    const unit = product.price + addOns.reduce((s, a) => s + a.price, 0);
    return { product, addOns, quantity: line.quantity, total: unit * line.quantity };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  const distanceKm = useMemo(() => {
    if (!merchant || !address) return 0;
    return Math.max(0.4, Math.round(distanceBetween(merchant.location, address.location) * 10) / 10);
  }, [merchant, address]);

  const deliveryFee = address?.zoneId ? calcDeliveryFee(address.zoneId, distanceKm) ?? 15 : null;

  const promo = appliedPromo ? promos.find((p) => p.code === appliedPromo) : undefined;
  const discount = promo ? (promo.type === "percent" ? subtotal * (promo.value / 100) : promo.type === "fixed" ? promo.value : 0) : 0;
  const finalFee = promo?.type === "free_delivery" ? 0 : deliveryFee ?? 0;
  const total = subtotal + finalFee - discount;

  function applyPromo() {
    const p = promos.find((x) => x.code.toLowerCase() === promoInput.trim().toLowerCase());
    if (!p || !p.active) {
      setPromoError("Invalid or expired code");
      setAppliedPromo(null);
      return;
    }
    if (subtotal < p.minOrder) {
      setPromoError(`Minimum order ${formatCurrency(p.minOrder, locale)}`);
      setAppliedPromo(null);
      return;
    }
    setPromoError("");
    setAppliedPromo(p.code);
  }

  const [orderPlaced, setOrderPlaced] = useState(false);

  function handlePlaceOrder() {
    if (!address) return;
    setPlacing(true);
    setTimeout(() => {
      const order = placeOrder({ addressId: address.id, promoCode: appliedPromo ?? undefined });
      setPlacing(false);
      if (order) {
        setOrderPlaced(true);
        router.push(`/customer/orders/${order.id}?justPlaced=1`);
      }
    }, 700);
  }

  useEffect(() => {
    if (!orderPlaced && (!merchant || lines.length === 0)) {
      router.replace("/customer/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant, lines.length, orderPlaced]);

  if (!merchant || lines.length === 0) {
    return null;
  }

  return (
    <CustomerScreen title={t("customer.checkout")} showBack noBottomNav>
      <div className="flex flex-col gap-4 p-4 pb-40">
        <Card>
          <CardBody className="pt-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
              <MapPin className="h-4 w-4 text-brand-500" /> {t("customer.deliverTo")}
            </div>
            <div className="flex flex-col gap-2">
              {customer?.addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveAddress(a.id)}
                  className={cn(
                    "flex items-start justify-between rounded-xl border px-3.5 py-2.5 text-left",
                    address?.id === a.id ? "border-brand-500 bg-brand-50" : "border-ink-200"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{a.label}</p>
                    <p className="text-xs text-ink-500">{a.line1}</p>
                  </div>
                  {address?.id === a.id && <Check className="h-4 w-4 text-brand-500" />}
                </button>
              ))}
            </div>
            {!address?.zoneId && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-danger-50 px-3 py-2.5 text-xs font-semibold text-danger-600">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {t("customer.outOfCoverage")}
              </div>
            )}
            {address?.zoneId && <p className="mt-2 text-xs text-ink-400">{formatDistance(distanceKm)} from {merchant.name}</p>}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <p className="mb-3 text-sm font-bold text-ink-900">Order summary</p>
            <div className="flex flex-col gap-2">
              {lines.map((l, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-ink-600">{l.quantity}× {locale === "ar" ? l.product.nameAr : l.product.name}</span>
                  <span className="font-semibold text-ink-800">{formatCurrency(l.total, locale)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
              <Ticket className="h-4 w-4 text-brand-500" /> {t("common.promoCode")}
            </div>
            {appliedPromo ? (
              <Badge tone="success">{appliedPromo} applied</Badge>
            ) : (
              <div className="flex gap-2">
                <Input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="e.g. WELCOME20" />
                <Button variant="outline" onClick={applyPromo}>
                  {t("common.apply")}
                </Button>
              </div>
            )}
            {promoError && <p className="mt-1.5 text-xs font-semibold text-danger-500">{promoError}</p>}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-2 pt-5 text-sm font-bold text-ink-900">
            <Wallet className="h-4 w-4 text-brand-500" /> Cash on Delivery
            <Badge tone="brand" className="ml-auto">Only option</Badge>
          </CardBody>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-ink-100 bg-white p-4">
        <div className="mb-1 flex justify-between text-xs text-ink-500">
          <span>{t("common.subtotal")}</span>
          <span>{formatCurrency(subtotal, locale)}</span>
        </div>
        <div className="mb-1 flex justify-between text-xs text-ink-500">
          <span>{t("common.deliveryFee")}</span>
          <span>{address?.zoneId ? formatCurrency(finalFee, locale) : "—"}</span>
        </div>
        {discount > 0 && (
          <div className="mb-1 flex justify-between text-xs text-success-600">
            <span>{t("common.discount")}</span>
            <span>-{formatCurrency(discount, locale)}</span>
          </div>
        )}
        <div className="mb-3 flex justify-between text-sm font-bold text-ink-900">
          <span>{t("common.total")}</span>
          <span>{formatCurrency(total, locale)}</span>
        </div>
        <Button size="lg" className="w-full" disabled={!address?.zoneId} loading={placing} onClick={handlePlaceOrder}>
          {t("customer.placeOrder")}
        </Button>
      </div>
    </CustomerScreen>
  );
}
