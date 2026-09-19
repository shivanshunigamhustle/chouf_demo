"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody } from "@/components/ui/Primitives";
import { SimMap } from "@/components/map/SimMap";

export default function AdminZones() {
  const { locale } = useT();
  const zones = useChoufStore((s) => s.zones);
  const merchants = useChoufStore((s) => s.merchants);
  const customers = useChoufStore((s) => s.customers);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-ink-900">Delivery zones</h1>
        <p className="text-sm text-ink-400">Coverage areas that determine delivery eligibility and fees.</p>
      </div>

      <Card>
        <CardBody className="pt-4">
          <SimMap zones={zones} merchants={merchants} height={420} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {zones.map((z) => {
          const merchantCount = merchants.filter((m) => m.zoneId === z.id).length;
          const addressCount = customers.reduce((s, c) => s + c.addresses.filter((a) => a.zoneId === z.id).length, 0);
          return (
            <Card key={z.id}>
              <CardBody className="pt-5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: z.color }} />
                  <p className="text-sm font-bold text-ink-900">{locale === "ar" ? z.nameAr : z.name}</p>
                </div>
                <p className="mt-2 text-xs text-ink-400">{merchantCount} merchants · {addressCount} customer addresses</p>
              </CardBody>
            </Card>
          );
        })}
        <Card className="flex items-center justify-center border-dashed">
          <CardBody className="pt-5 text-center">
            <p className="text-xs font-semibold text-ink-400">+ Add new zone</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
