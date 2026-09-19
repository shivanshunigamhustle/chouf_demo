"use client";

import { useEffect, useState } from "react";
import { useChoufStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const locale = useChoufStore((s) => s.locale);
  const tick = useChoufStore((s) => s.tick);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard client-mount guard to avoid SSR/CSR hydration mismatch
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const id = setInterval(() => tick(), 1500);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "chouf-demo-store") {
        useChoufStore.persist.rehydrate();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-black text-white shadow-pop">
            C
          </div>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-ink-800">
            <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-brand-500 via-brand-300 to-brand-500" />
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
