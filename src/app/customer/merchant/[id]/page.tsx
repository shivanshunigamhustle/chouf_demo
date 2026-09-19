"use client";

import { use, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { RatingBadge } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Primitives";
import { ProductSheet } from "@/components/customer/ProductSheet";
import { Plus, Clock, MapPinned, Tag } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function MerchantDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, locale } = useT();
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === id));
  const products = useChoufStore(useShallow((s) => s.products.filter((p) => p.merchantId === id)));
  const cartCount = useChoufStore((s) => (s.cart.merchantId === id ? s.cart.lines.reduce((n, l) => n + l.quantity, 0) : 0));
  const [activeCat, setActiveCat] = useState<string>("All");
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const filtered = activeCat === "All" ? products : products.filter((p) => p.category === activeCat);

  if (!merchant) {
    return (
      <CustomerScreen title="Not found" showBack>
        <p className="p-6 text-sm text-ink-500">Merchant not found.</p>
      </CustomerScreen>
    );
  }

  return (
    <CustomerScreen noTopBar>
      <div className="relative flex h-40 items-center justify-center text-5xl font-black text-white" style={{ backgroundColor: merchant.logoColor }}>
        {merchant.logoInitial}
        <button
          onClick={() => router.back()}
          className="absolute left-3 top-3 rounded-full bg-black/25 p-2 text-white backdrop-blur rtl:right-3 rtl:left-auto"
        >
          ←
        </button>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black text-ink-900">{locale === "ar" ? merchant.nameAr : merchant.name}</h1>
            <p className="mt-0.5 text-xs text-ink-400">{merchant.tags.join(" · ")}</p>
          </div>
          {!merchant.isOpen && <Badge tone="danger">{t("common.closed")}</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-500">
          <RatingBadge rating={merchant.rating} count={merchant.ratingCount} size="md" />
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{merchant.etaMinutes[0]}-{merchant.etaMinutes[1]} {t("common.min")}</span>
          <span className="flex items-center gap-1"><MapPinned className="h-3.5 w-3.5" />{locale === "ar" ? merchant.addressAr : merchant.address}</span>
        </div>
        {merchant.hasPromo && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-600">
            <Tag className="h-3.5 w-3.5" /> {merchant.promoLabel} · Min order {formatCurrency(merchant.minOrder, locale)}
          </div>
        )}
      </div>

      <div className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-y border-ink-100 bg-white px-4 py-2.5 [scrollbar-width:none]">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              activeCat === c ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 text-ink-600"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4 py-4 pb-24">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => p.available && setSheetProduct(p)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-ink-100 p-3 text-left shadow-card",
              !p.available && "opacity-50"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-ink-900">{locale === "ar" ? p.nameAr : p.name}</p>
                {p.popular && <Badge tone="brand">Popular</Badge>}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">{locale === "ar" ? p.descriptionAr : p.description}</p>
              <p className="mt-1.5 text-sm font-bold text-ink-900">{formatCurrency(p.price, locale)}</p>
              {!p.available && <p className="mt-1 text-[11px] font-semibold text-danger-500">Currently unavailable</p>}
            </div>
            <div
              className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-2xl font-black text-white"
              style={{ backgroundColor: merchant.logoColor }}
            >
              🍽️
              {p.available && (
                <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-600 shadow-pop">
                  <Plus className="h-4 w-4" />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto max-w-[440px] px-4">
          <button
            onClick={() => router.push("/customer/cart")}
            className="flex w-full items-center justify-between rounded-2xl bg-ink-900 px-5 py-3.5 text-sm font-bold text-white shadow-pop"
          >
            <span>{t("customer.yourCart")}</span>
            <span>{cartCount} items →</span>
          </button>
        </div>
      )}

      <ProductSheet product={sheetProduct} open={!!sheetProduct} onClose={() => setSheetProduct(null)} />
    </CustomerScreen>
  );
}
