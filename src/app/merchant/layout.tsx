"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGate } from "@/components/layout/AuthGate";
import { useChoufStore } from "@/lib/store";
import { LayoutGrid, Receipt, UtensilsCrossed, Tags, Clock, Building2, BarChart3, Map } from "lucide-react";

const NAV = [
  { href: "/merchant/dashboard", icon: LayoutGrid, labelKey: "nav.dashboard" },
  { href: "/merchant/orders", icon: Receipt, labelKey: "nav.orders" },
  { href: "/merchant/live-map", icon: Map, labelKey: "nav.liveMap" },
  { href: "/merchant/products", icon: UtensilsCrossed, labelKey: "nav.products" },
  { href: "/merchant/categories", icon: Tags, labelKey: "nav.categories" },
  { href: "/merchant/availability", icon: Clock, labelKey: "nav.availability" },
  { href: "/merchant/reports", icon: BarChart3, labelKey: "nav.reports" },
  { href: "/merchant/profile", icon: Building2, labelKey: "nav.profile" },
];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const merchants = useChoufStore((s) => s.merchants);
  const activeMerchantId = useChoufStore((s) => s.activeMerchantId);
  const setActiveMerchant = useChoufStore((s) => s.setActiveMerchant);
  const merchantSession = useChoufStore((s) => s.merchantSession);
  const merchantLogout = useChoufStore((s) => s.merchantLogout);
  const merchant = merchants.find((m) => m.id === activeMerchantId);

  if (pathname === "/merchant/login") return <>{children}</>;

  return (
    <AuthGate authed={!!merchantSession} loginHref="/merchant/login">
      <DashboardShell
        navItems={NAV}
        brand={merchant?.name ?? "Merchant"}
        brandColor={merchant?.logoColor ?? "#ff5a1f"}
        audience="merchant"
        audienceId={activeMerchantId}
        onLogout={merchantLogout}
        logoutHref="/merchant/login"
        headerRight={
          <select
            value={activeMerchantId}
            onChange={(e) => setActiveMerchant(e.target.value)}
            className="hidden rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 sm:block"
          >
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        }
      >
        {children}
      </DashboardShell>
    </AuthGate>
  );
}
