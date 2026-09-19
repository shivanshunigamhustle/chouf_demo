"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Label, Input, Badge } from "@/components/ui/Primitives";
import { RatingBadge } from "@/components/ui/RatingStars";
import { Building2, MapPin } from "lucide-react";

export default function MerchantProfile() {
  const { locale } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === activeMerchantId));
  if (!merchant) return null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-black text-ink-900">Profile & branches</h1>

      <Card>
        <CardBody className="flex items-center gap-4 pt-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white" style={{ backgroundColor: merchant.logoColor }}>
            {merchant.logoInitial}
          </div>
          <div>
            <p className="text-lg font-bold text-ink-900">{locale === "ar" ? merchant.nameAr : merchant.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <RatingBadge rating={merchant.rating} count={merchant.ratingCount} />
              <Badge tone="brand" className="capitalize">{merchant.category}</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
          <div><Label>Business name</Label><Input defaultValue={merchant.name} /></div>
          <div><Label>Minimum order</Label><Input defaultValue={String(merchant.minOrder)} /></div>
          <div><Label>ETA range (minutes)</Label><Input defaultValue={`${merchant.etaMinutes[0]}-${merchant.etaMinutes[1]}`} /></div>
          <div><Label>Zone</Label><Input defaultValue={merchant.zoneId} disabled /></div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink-900"><Building2 className="h-4 w-4 text-brand-500" /> Branches ({merchant.branches})</p>
          <div className="flex flex-col gap-2">
            {Array.from({ length: merchant.branches }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
                <MapPin className="h-4 w-4 text-ink-400" />
                <span className="font-semibold text-ink-800">Branch {i + 1}</span>
                <span className="text-xs text-ink-400">{locale === "ar" ? merchant.addressAr : merchant.address}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
