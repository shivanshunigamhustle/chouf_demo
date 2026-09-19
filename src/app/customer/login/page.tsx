"use client";

import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Primitives";
import { useState } from "react";
import { Globe2 } from "lucide-react";

export default function CustomerLogin() {
  const router = useRouter();
  const { t, locale } = useT();
  const setLocale = useChoufStore((s) => s.setLocale);
  const customers = useChoufStore((s) => s.customers);
  const setActiveCustomer = useChoufStore((s) => s.setActiveCustomer);
  const [phone, setPhone] = useState(customers[0]?.phone ?? "");

  function handleLogin() {
    const match = customers.find((c) => c.phone === phone) ?? customers[0];
    setActiveCustomer(match.id);
    router.push("/customer/home");
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white p-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-xl font-black text-white">C</div>
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600"
          >
            <Globe2 className="h-3.5 w-3.5" /> {locale === "en" ? "AR" : "EN"}
          </button>
        </div>
        <h1 className="mt-8 text-2xl font-black text-ink-900">{t("customer.tagline")}</h1>
        <p className="mt-1 text-sm text-ink-500">Log in to continue ordering.</p>

        <div className="mt-8">
          <Label>Phone number</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 5X XXX XXXX" />
          <p className="mt-2 text-xs text-ink-400">Demo: pick any seeded phone number to sign in as that customer.</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {customers.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => setPhone(c.phone)}
                className="rounded-lg border border-ink-100 px-3 py-2 text-left text-xs text-ink-500 hover:border-brand-300"
              >
                {c.name} — {c.phone}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button size="lg" className="w-full" onClick={handleLogin}>
        {t("common.login")}
      </Button>
    </div>
  );
}
