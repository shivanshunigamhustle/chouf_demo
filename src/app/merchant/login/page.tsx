"use client";

import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Primitives";
import { useState } from "react";
import { Store } from "lucide-react";

export default function MerchantLogin() {
  const router = useRouter();
  const { t } = useT();
  const merchants = useChoufStore((s) => s.merchants);
  const setActiveMerchant = useChoufStore((s) => s.setActiveMerchant);
  const [merchantId, setMerchantId] = useState(merchants[0]?.id);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-ink-200 bg-white p-7 shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-info-500 text-white"><Store className="h-5.5 w-5.5" /></div>
        <h1 className="mt-5 text-xl font-black text-ink-900">Merchant Login</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in to manage your storefront.</p>
        <div className="mt-6">
          <Label>Select your business (demo)</Label>
          <Select value={merchantId} onChange={(e) => setMerchantId(e.target.value)}>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </div>
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            setActiveMerchant(merchantId);
            router.push("/merchant/dashboard");
          }}
        >
          {t("common.login")}
        </Button>
      </div>
    </div>
  );
}
