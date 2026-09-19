"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody } from "@/components/ui/Primitives";
import { formatCurrency } from "@/lib/utils";

export default function MerchantCategories() {
  const { t, locale } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const products = useChoufStore(useShallow((s) => s.products.filter((p) => p.merchantId === activeMerchantId)));

  const categories = useMemo(() => {
    const map = new Map<string, { nameAr: string; items: typeof products }>();
    products.forEach((p) => {
      const entry = map.get(p.category) ?? { nameAr: p.categoryAr, items: [] as typeof products };
      entry.items.push(p);
      map.set(p.category, entry);
    });
    return Array.from(map.entries());
  }, [products]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-black text-ink-900">{t("nav.categories")}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(([name, { nameAr, items }]) => {
          const avg = items.reduce((s, p) => s + p.price, 0) / items.length;
          return (
            <Card key={name}>
              <CardBody className="pt-5">
                <p className="text-sm font-bold text-ink-900">{locale === "ar" ? nameAr : name}</p>
                <p className="mt-1 text-xs text-ink-400">{items.length} products</p>
                <p className="mt-2 text-xs text-ink-500">Avg price {formatCurrency(avg, locale)}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
