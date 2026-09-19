"use client";

import { useState } from "react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Badge, Switch } from "@/components/ui/Primitives";
import { RatingBadge } from "@/components/ui/RatingStars";
import { Search } from "lucide-react";

export default function AdminMerchants() {
  const { locale } = useT();
  const merchants = useChoufStore((s) => s.merchants);
  const setMerchantOpen = useChoufStore((s) => s.setMerchantOpen);
  const [query, setQuery] = useState("");

  const filtered = merchants.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-black text-ink-900">Merchants</h1>
        <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 sm:w-72">
          <Search className="h-4 w-4 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search merchants" className="w-full bg-transparent text-sm outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id}>
            <CardBody className="pt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black text-white" style={{ backgroundColor: m.logoColor }}>
                    {m.logoInitial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-900">{locale === "ar" ? m.nameAr : m.name}</p>
                    <p className="text-xs capitalize text-ink-400">{m.category} · {m.branches} branch(es)</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <RatingBadge rating={m.rating} count={m.ratingCount} />
                <Switch checked={m.isOpen} onChange={(v) => setMerchantOpen(m.id, v)} size="sm" />
              </div>
              {m.hasPromo && <Badge tone="brand" className="mt-3">{m.promoLabel}</Badge>}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
