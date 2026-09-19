"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, CardHeader, Input } from "@/components/ui/Primitives";
import { formatCurrency } from "@/lib/utils";

export default function AdminDeliveryRules() {
  const { locale } = useT();
  const zones = useChoufStore((s) => s.zones);
  const feeTiers = useChoufStore((s) => s.feeTiers);
  const updateFeeTier = useChoufStore((s) => s.updateFeeTier);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-ink-900">Delivery fee rules</h1>
        <p className="text-sm text-ink-400">Distance-based delivery fees, configured per zone.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {zones.map((z) => (
          <Card key={z.id}>
            <CardHeader>
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: z.color }} />
                {locale === "ar" ? z.nameAr : z.name}
              </h2>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex flex-col divide-y divide-ink-100">
                {feeTiers.filter((t) => t.zoneId === z.id).map((tier) => (
                  <div key={tier.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-ink-600">
                      {tier.minKm} – {tier.maxKm >= 999 ? "∞" : tier.maxKm} km
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        value={tier.fee}
                        onChange={(e) => updateFeeTier(tier.id, Number(e.target.value))}
                        className="h-8 w-24 text-right"
                      />
                      <span className="text-xs text-ink-400">AED</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="pt-5">
          <p className="text-xs text-ink-400">
            Example: a 3.4 km order in Downtown currently costs {formatCurrency(feeTiers.find((t) => t.zoneId === zones[0]?.id && t.minKm <= 3.4 && t.maxKm > 3.4)?.fee ?? 0, locale)}.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
