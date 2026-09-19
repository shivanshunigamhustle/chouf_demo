"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGate } from "@/components/layout/AuthGate";
import { useChoufStore } from "@/lib/store";
import {
  LayoutGrid,
  Receipt,
  Map,
  Store,
  Bike,
  Users,
  Shapes,
  Percent,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", icon: LayoutGrid, labelKey: "nav.overview" },
  { href: "/admin/orders", icon: Receipt, labelKey: "nav.orders" },
  { href: "/admin/live-map", icon: Map, labelKey: "nav.liveMap" },
  { href: "/admin/merchants", icon: Store, labelKey: "nav.merchants" },
  { href: "/admin/drivers", icon: Bike, labelKey: "nav.drivers" },
  { href: "/admin/customers", icon: Users, labelKey: "nav.customers" },
  { href: "/admin/zones", icon: Shapes, labelKey: "nav.zones" },
  { href: "/admin/delivery-rules", icon: Percent, labelKey: "nav.deliveryRules" },
  { href: "/admin/promotions", icon: Percent, labelKey: "nav.promotions" },
  { href: "/admin/support", icon: LifeBuoy, labelKey: "nav.tickets" },
  { href: "/admin/reports", icon: BarChart3, labelKey: "nav.reports" },
  { href: "/admin/users", icon: ShieldCheck, labelKey: "nav.users" },
  { href: "/admin/settings", icon: Settings, labelKey: "nav.settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminSession = useChoufStore((s) => s.adminSession);
  const adminLogout = useChoufStore((s) => s.adminLogout);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <AuthGate authed={!!adminSession} loginHref="/admin/login">
      <DashboardShell
        navItems={NAV}
        brand={adminSession ? adminSession.name : "Admin console"}
        brandColor="#171b26"
        audience="admin"
        onLogout={adminLogout}
        logoutHref="/admin/login"
      >
        {children}
      </DashboardShell>
    </AuthGate>
  );
}
