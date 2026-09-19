"use client";

import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { t, locale } = useT();
  const cart = useChoufStore((s) => s.cart);
  const products = useChoufStore((s) => s.products);
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === s.cart.merchantId));
  const updateQty = useChoufStore((s) => s.updateCartQty);
  const removeFromCart = useChoufStore((s) => s.removeFromCart);

  const lines = cart.lines.map((line) => {
    const product = products.find((p) => p.id === line.productId)!;
    const addOns = product.addOns.filter((a) => line.addOnIds.includes(a.id));
    const unit = product.price + addOns.reduce((s, a) => s + a.price, 0);
    return { line, product, addOns, unit, total: unit * line.quantity };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  return (
    <CustomerScreen title={t("customer.yourCart")} showBack noBottomNav={lines.length === 0}>
      {lines.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={<ShoppingCart className="h-10 w-10" />} title={t("customer.emptyCart")} subtitle="Browse merchants and add something delicious." />
          <Button className="mt-4 w-full" onClick={() => router.push("/customer/home")}>
            {t("nav.home")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col pb-32">
          {merchant && (
            <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white" style={{ backgroundColor: merchant.logoColor }}>
                {merchant.logoInitial}
              </div>
              <p className="text-sm font-bold text-ink-900">{locale === "ar" ? merchant.nameAr : merchant.name}</p>
            </div>
          )}
          <div className="flex flex-col divide-y divide-ink-100 px-4">
            {lines.map(({ line, product, addOns, total }) => (
              <div key={line.productId + line.addOnIds.join()} className="flex items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{locale === "ar" ? product.nameAr : product.name}</p>
                  {addOns.length > 0 && <p className="text-xs text-ink-400">+ {addOns.map((a) => (locale === "ar" ? a.nameAr : a.name)).join(", ")}</p>}
                  <p className="mt-1 text-sm font-bold text-brand-600">{formatCurrency(total, locale)}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-ink-200 px-1.5 py-1">
                  <button
                    onClick={() => (line.quantity === 1 ? removeFromCart(line.productId) : updateQty(line.productId, line.quantity - 1))}
                    className="rounded-full p-1 hover:bg-ink-100"
                  >
                    {line.quantity === 1 ? <Trash2 className="h-3.5 w-3.5 text-danger-500" /> : <Minus className="h-3.5 w-3.5" />}
                  </button>
                  <span className="w-4 text-center text-sm font-bold">{line.quantity}</span>
                  <button onClick={() => updateQty(line.productId, line.quantity + 1)} className="rounded-full p-1 hover:bg-ink-100">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-ink-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-ink-500">{t("common.subtotal")}</span>
              <span className="font-bold text-ink-900">{formatCurrency(subtotal, locale)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={() => router.push("/customer/checkout")}>
              {t("customer.checkout")} · {formatCurrency(subtotal, locale)}
            </Button>
          </div>
        </div>
      )}
    </CustomerScreen>
  );
}
