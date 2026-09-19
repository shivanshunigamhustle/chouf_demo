"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/useT";
import { useChoufStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Minus, Plus } from "lucide-react";

export function ProductSheet({ product, open, onClose }: { product: Product | null; open: boolean; onClose: () => void }) {
  const { t, locale } = useT();
  const addToCart = useChoufStore((s) => s.addToCart);
  const merchantColor = useChoufStore((s) => s.merchants.find((m) => m.id === product?.merchantId)?.logoColor ?? "#ff5a1f");
  const [qty, setQty] = useState(1);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);

  if (!product) return null;
  const addOnsTotal = product.addOns.filter((a) => addOnIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const lineTotal = (product.price + addOnsTotal) * qty;

  function toggleAddOn(id: string) {
    setAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleAdd() {
    addToCart(product!.merchantId, { productId: product!.id, quantity: qty, addOnIds });
    setQty(1);
    setAddOnIds([]);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div
        className="mb-4 flex h-40 items-center justify-center rounded-2xl text-4xl font-black text-white"
        style={{ backgroundColor: merchantColor }}
      >
        🍽️
      </div>
      <h3 className="text-lg font-bold text-ink-900">{locale === "ar" ? product.nameAr : product.name}</h3>
      <p className="mt-1 text-sm text-ink-500">{locale === "ar" ? product.descriptionAr : product.description}</p>
      <p className="mt-2 text-lg font-bold text-brand-600">{formatCurrency(product.price, locale)}</p>

      {product.addOns.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Add-ons</p>
          <div className="flex flex-col gap-2">
            {product.addOns.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAddOn(a.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm",
                  addOnIds.includes(a.id) ? "border-brand-500 bg-brand-50" : "border-ink-200"
                )}
              >
                <span className="font-medium text-ink-800">{locale === "ar" ? a.nameAr : a.name}</span>
                <span className="text-ink-500">+{formatCurrency(a.price, locale)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3 rounded-full border border-ink-200 px-2 py-1.5">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="rounded-full p-1 hover:bg-ink-100">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center text-sm font-bold">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="rounded-full p-1 hover:bg-ink-100">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={handleAdd} disabled={!product.available} size="lg">
          {product.available ? `${t("common.addToCart")} · ${formatCurrency(lineTotal, locale)}` : "Unavailable"}
        </Button>
      </div>
    </BottomSheet>
  );
}
