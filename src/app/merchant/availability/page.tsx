"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Switch } from "@/components/ui/Primitives";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MerchantAvailability() {
  const { t } = useT();
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const merchant = useChoufStore((s) => s.merchants.find((m) => m.id === activeMerchantId));
  const setMerchantOpen = useChoufStore((s) => s.setMerchantOpen);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-black text-ink-900">{t("nav.availability")}</h1>

      <Card>
        <CardBody className="flex items-center justify-between pt-5">
          <div>
            <p className="text-sm font-bold text-ink-900">Storefront status</p>
            <p className="text-xs text-ink-400">Toggle off to pause new incoming orders instantly.</p>
          </div>
          <Switch checked={!!merchant?.isOpen} onChange={(v) => setMerchantOpen(activeMerchantId, v)} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <p className="mb-4 text-sm font-bold text-ink-900">Weekly operating hours</p>
          <div className="flex flex-col divide-y divide-ink-100">
            {DAYS.map((d) => (
              <div key={d} className="flex items-center justify-between py-2.5 text-sm">
                <span className="w-12 font-semibold text-ink-700">{d}</span>
                <span className="text-ink-500">09:00 — 23:30</span>
                <span className="text-xs font-semibold text-success-600">Open</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
