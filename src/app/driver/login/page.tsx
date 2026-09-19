"use client";

import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Primitives";
import { useState } from "react";
import { Bike, Globe2 } from "lucide-react";

export default function DriverLogin() {
  const router = useRouter();
  const { t, locale } = useT();
  const setLocale = useChoufStore((s) => s.setLocale);
  const drivers = useChoufStore((s) => s.drivers);
  const setActiveDriver = useChoufStore((s) => s.setActiveDriver);
  const [phone, setPhone] = useState(drivers[0]?.phone ?? "");

  function handleLogin() {
    const match = drivers.find((d) => d.phone === phone) ?? drivers[0];
    setActiveDriver(match.id);
    router.push("/driver/home");
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-ink-950 p-6 text-white">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-white"><Bike className="h-5.5 w-5.5" /></div>
          <button onClick={() => setLocale(locale === "en" ? "ar" : "en")} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <Globe2 className="h-3.5 w-3.5" /> {locale === "en" ? "AR" : "EN"}
          </button>
        </div>
        <h1 className="mt-8 text-2xl font-black">Driver Login</h1>
        <p className="mt-1 text-sm text-white/50">Sign in to start accepting deliveries.</p>

        <div className="mt-8">
          <Label className="text-white/70">Phone number</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white/5 text-white" placeholder="+971 5X XXX XXXX" />
          <p className="mt-2 text-xs text-white/40">Demo: pick any seeded driver to sign in.</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {drivers.slice(0, 5).map((d) => (
              <button key={d.id} onClick={() => setPhone(d.phone)} className="rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-white/60 hover:border-teal-400">
                {d.name} — {d.phone}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button size="lg" className="w-full bg-teal-500 hover:bg-teal-600" onClick={handleLogin}>
        {t("common.login")}
      </Button>
    </div>
  );
}
