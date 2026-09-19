"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { Globe2, Menu, X, LogOut, Bell } from "lucide-react";
import { NotificationToasts } from "@/components/ui/NotificationToasts";
import type { NotificationEvent } from "@/lib/types";

export type NavItem = { href: string; icon: React.ElementType; labelKey: string };

export function DashboardShell({
  children,
  navItems,
  brand,
  brandColor,
  audience,
  audienceId,
  headerRight,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  brand: string;
  brandColor: string;
  audience: NotificationEvent["audience"];
  audienceId?: string;
  headerRight?: React.ReactNode;
}) {
  const pathname = usePathname();
  const locale = useChoufStore((s) => s.locale);
  const setLocale = useChoufStore((s) => s.setLocale);
  const { t } = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifications = useChoufStore(useShallow((s) => s.notifications.filter((n) => n.audience === audience)));

  const SidebarContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[13px] text-base font-extrabold text-white shadow-icon"
          style={{ background: `linear-gradient(145deg, ${brandColor}, ${brandColor}cc)` }}
        >
          C
        </div>
        <div>
          <p className="font-display text-[15px] font-bold leading-tight text-white">{t("appName")}</p>
          <p className="text-[11px] font-medium text-white/35">{brand}</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150",
                active ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" : "text-white/45 hover:bg-white/[0.04] hover:text-white/85"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-brand-500 rtl:left-auto rtl:right-0" />}
              <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-brand-400" : "text-white/35 group-hover:text-white/70")} strokeWidth={2.1} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-5 pt-2">
        <div className="mb-2 h-px bg-white/[0.06]" />
        <Link href="/" className="flex items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[13.5px] font-medium text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/70">
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2.1} /> {t("common.logout")}
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      <NotificationToasts audience={audience} audienceId={audienceId} />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-gradient-to-b from-ink-950 to-[#0e1220] lg:flex rtl:left-auto rtl:right-0">{SidebarContent}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-ink-950 to-[#0e1220] rtl:left-auto rtl:right-0">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-white/60">
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-60 rtl:lg:pl-0 rtl:lg:pr-60">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200/70 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {headerRight}
            <button className="relative rounded-full p-2.5 text-ink-500 transition-colors hover:bg-ink-100">
              <Bell className="h-[18px] w-[18px]" strokeWidth={2.1} />
              {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />}
            </button>
            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-200/70"
            >
              <Globe2 className="h-3.5 w-3.5" strokeWidth={2.1} />
              {locale === "en" ? "العربية" : "English"}
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
