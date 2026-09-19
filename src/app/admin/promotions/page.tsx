"use client";

import { useChoufStore } from "@/lib/store";
import { Card, CardBody, Badge, Switch } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Plus, Ticket } from "lucide-react";

export default function AdminPromotions() {
  const promos = useChoufStore((s) => s.promos);
  const togglePromoActive = useChoufStore((s) => s.togglePromoActive);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ink-900">Promotions</h1>
        <Button size="sm"><Plus className="h-4 w-4" /> New promo</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((p) => (
          <Card key={p.id}>
            <CardBody className="pt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Ticket className="h-4.5 w-4.5" /></span>
                  <div>
                    <p className="text-sm font-black tracking-wide text-ink-900">{p.code}</p>
                    <p className="text-xs text-ink-400">
                      {p.type === "percent" ? `${p.value}% off` : p.type === "fixed" ? `${formatCurrency(p.value, "en")} off` : "Free delivery"}
                    </p>
                  </div>
                </div>
                <Switch checked={p.active} onChange={() => togglePromoActive(p.id)} size="sm" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
                <span>Min order {formatCurrency(p.minOrder, "en")}</span>
                <Badge tone={p.usageCount >= p.usageLimit ? "danger" : "neutral"}>{p.usageCount}/{p.usageLimit} used</Badge>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (p.usageCount / p.usageLimit) * 100)}%` }} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
