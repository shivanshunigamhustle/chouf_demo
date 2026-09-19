"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { RatingBadge } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Primitives";
import { Search, MapPin, ChevronDown, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MerchantCategory } from "@/lib/types";

const CATEGORIES: { key: MerchantCategory | "all"; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "restaurant", label: "Restaurants", emoji: "🍔" },
  { key: "supermarket", label: "Supermarket", emoji: "🛒" },
  { key: "pharmacy", label: "Pharmacy", emoji: "💊" },
  { key: "bakery", label: "Bakery", emoji: "🥐" },
  { key: "store", label: "Store", emoji: "🏪" },
];

export default function CustomerHome() {
  const { t, locale } = useT();
  const merchants = useChoufStore((s) => s.merchants);
  const customer = useChoufStore((s) => s.customers.find((c) => c.id === s.activeCustomerId));
  const [category, setCategory] = useState<MerchantCategory | "all">("all");
  const [query, setQuery] = useState("");

  const address = customer?.addresses.find((a) => a.isDefault) ?? customer?.addresses[0];

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      const matchCat = category === "all" || m.category === category;
      const matchQuery = query.trim() === "" || m.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [merchants, category, query]);

  const popular = [...merchants].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <CustomerScreen noTopBar>
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-4 pb-8 pt-5 text-white">
        <div className="flex items-center justify-between">
          <Link href="/customer/profile" className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="h-4 w-4" />
            {address ? `${address.label} · ${address.line1.split(",")[0]}` : t("customer.addAddress")}
            <ChevronDown className="h-3.5 w-3.5" />
          </Link>
          <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white/40">
            <div className="flex h-full w-full items-center justify-center bg-white/20 text-xs font-bold">
              {customer?.name.split(" ").map((n) => n[0]).join("")}
            </div>
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-black leading-tight">{t("customer.tagline")}</h1>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-soft">
          <Search className="h-4.5 w-4.5 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("customer.searchPlaceholder")}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      <div className="-mt-4 rounded-t-3xl bg-white pt-5">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                category === c.key ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 bg-white text-ink-600"
              )}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-5 px-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-bold text-ink-900">{t("customer.popularNearYou")}</h2>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
            {popular.map((m) => (
              <Link
                key={m.id}
                href={`/customer/merchant/${m.id}`}
                className="w-40 shrink-0 overflow-hidden rounded-2xl border border-ink-100 shadow-card"
              >
                <div
                  className="flex h-20 items-center justify-center text-2xl font-black text-white"
                  style={{ backgroundColor: m.logoColor }}
                >
                  {m.logoInitial}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-ink-900">{locale === "ar" ? m.nameAr : m.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <RatingBadge rating={m.rating} />
                    <span className="text-[10px] text-ink-400">{m.etaMinutes[0]}-{m.etaMinutes[1]} {t("common.min")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 px-4 pb-6">
          <h2 className="text-sm font-bold text-ink-900">{t("customer.allMerchants")}</h2>
          <div className="mt-3 flex flex-col gap-3">
            {filtered.map((m) => (
              <Link
                key={m.id}
                href={`/customer/merchant/${m.id}`}
                className="flex gap-3 overflow-hidden rounded-2xl border border-ink-100 p-2.5 shadow-card"
              >
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl font-black text-white"
                  style={{ backgroundColor: m.logoColor }}
                >
                  {m.logoInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-bold text-ink-900">{locale === "ar" ? m.nameAr : m.name}</p>
                    {!m.isOpen && <Badge tone="danger">{t("common.closed")}</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-400">{m.tags.join(" · ")}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-500">
                    <RatingBadge rating={m.rating} count={m.ratingCount} />
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {m.etaMinutes[0]}-{m.etaMinutes[1]} {t("common.min")}
                    </span>
                  </div>
                  {m.hasPromo && (
                    <span className="mt-1.5 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                      {m.promoLabel}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CustomerScreen>
  );
}
