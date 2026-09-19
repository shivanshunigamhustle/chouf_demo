"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Badge, Switch, EmptyState } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { AddProductModal } from "@/components/merchant/AddProductModal";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";

export default function MerchantProducts() {
  const { t, locale } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const products = useChoufStore(useShallow((s) => s.products.filter((p) => p.merchantId === activeMerchantId)));
  const toggleAvailability = useChoufStore((s) => s.toggleProductAvailability);
  const removeProduct = useChoufStore((s) => s.removeProduct);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-ink-900">{t("merchant.manageMenu")}</h1>
          <p className="mt-1 text-sm text-ink-400">{products.length} products on your menu</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 sm:w-80">
        <Search className="h-4 w-4 text-ink-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-10 w-10" />}
          title={products.length === 0 ? "No products yet" : "No products match your search"}
          subtitle={products.length === 0 ? "Add your first product to start taking orders." : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="group relative">
              <CardBody className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">{locale === "ar" ? p.nameAr : p.name}</p>
                    <p className="text-xs text-ink-400">{locale === "ar" ? p.categoryAr : p.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {p.popular && <Badge tone="brand">Popular</Badge>}
                    <button
                      onClick={() => removeProduct(p.id)}
                      className="rounded-lg p-1.5 text-ink-300 opacity-0 transition-opacity hover:bg-danger-50 hover:text-danger-500 group-hover:opacity-100"
                      title="Remove product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm font-bold text-ink-900">{formatCurrency(p.price, locale)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn("text-xs font-semibold", p.available ? "text-success-600" : "text-danger-500")}>
                    {p.available ? t("common.active") : t("common.inactive")}
                  </span>
                  <Switch checked={p.available} onChange={() => toggleAvailability(p.id)} size="sm" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <AddProductModal open={modalOpen} onClose={() => setModalOpen(false)} merchantId={activeMerchantId} existingCategories={categories} />
    </div>
  );
}
