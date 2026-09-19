"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Bike, History, User, ChevronLeft, Globe2 } from "lucide-react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { NotificationToasts } from "@/components/ui/NotificationToasts";

const TABS = [
  { href: "/driver/home", icon: Home, key: "nav.deliveries" },
  { href: "/driver/history", icon: History, key: "nav.history" },
  { href: "/driver/profile", icon: User, key: "nav.profile" },
];

function DriverTopBar({ title, showBack }: { title?: string; showBack?: boolean }) {
  const router = useRouter();
  const locale = useChoufStore((s) => s.locale);
  const setLocale = useChoufStore((s) => s.setLocale);
  const { t } = useT();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink-950 px-4 py-3">
      <div className="flex items-center gap-2 text-white">
        {showBack ? (
          <button onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-white/10">
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-black">
            <Bike className="h-4.5 w-4.5" />
          </div>
        )}
        <span className="text-base font-bold">{title ?? t("appName")}</span>
      </div>
      <button
        onClick={() => setLocale(locale === "en" ? "ar" : "en")}
        className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/80"
      >
        <Globe2 className="h-3.5 w-3.5" />
        {locale === "en" ? "AR" : "EN"}
      </button>
    </div>
  );
}

function DriverBottomNav() {
  const pathname = usePathname();
  const { t } = useT();
  return (
    <div className="sticky bottom-0 z-30 border-t border-white/10 bg-ink-950 px-2 pb-[env(safe-area-inset-bottom)] pt-1">
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/driver/home" && pathname?.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-semibold", active ? "text-teal-400" : "text-white/40")}
            >
              <tab.icon className="h-5 w-5" />
              {t(tab.key)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DriverScreen({
  children,
  title,
  showBack,
  noBottomNav,
}: {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  noBottomNav?: boolean;
}) {
  const activeDriverId = useChoufStore((s) => s.activeDriverId);
  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-white">
      <NotificationToasts audience="driver" audienceId={activeDriverId} />
      <DriverTopBar title={title} showBack={showBack} />
      <div className="flex-1 bg-ink-50 text-ink-900">{children}</div>
      {!noBottomNav && <DriverBottomNav />}
    </div>
  );
}
