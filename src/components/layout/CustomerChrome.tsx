"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Receipt, ShoppingCart, User, ChevronLeft, Globe2, LifeBuoy } from "lucide-react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { NotificationToasts } from "@/components/ui/NotificationToasts";

const TABS = [
  { href: "/customer/home", icon: Home, key: "nav.home" },
  { href: "/customer/orders", icon: Receipt, key: "nav.orders" },
  { href: "/customer/cart", icon: ShoppingCart, key: "nav.cart" },
  { href: "/customer/profile", icon: User, key: "nav.profile" },
];

export function CustomerTopBar({ title, showBack }: { title?: string; showBack?: boolean }) {
  const router = useRouter();
  const locale = useChoufStore((s) => s.locale);
  const setLocale = useChoufStore((s) => s.setLocale);
  const { t } = useT();

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-ink-100">
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-black text-white">C</div>
        )}
        <span className="text-base font-bold text-ink-900">{title ?? t("appName")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Link href="/customer/support" className="rounded-full p-2 text-ink-500 hover:bg-ink-100">
          <LifeBuoy className="h-4.5 w-4.5" />
        </Link>
        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1.5 text-xs font-semibold text-ink-600"
        >
          <Globe2 className="h-3.5 w-3.5" />
          {locale === "en" ? "AR" : "EN"}
        </button>
      </div>
    </div>
  );
}

export function CustomerBottomNav() {
  const pathname = usePathname();
  const cartCount = useChoufStore((s) => s.cart.lines.reduce((sum, l) => sum + l.quantity, 0));
  const { t } = useT();

  return (
    <div className="sticky bottom-0 z-30 border-t border-ink-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur">
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/customer/home" && pathname?.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors",
                active ? "text-brand-600" : "text-ink-400"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.key === "nav.cart" && cartCount > 0 && (
                <span className="absolute right-4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] text-white">
                  {cartCount}
                </span>
              )}
              {t(tab.key)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function CustomerScreen({
  children,
  title,
  showBack,
  noTopBar,
  noBottomNav,
}: {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  noTopBar?: boolean;
  noBottomNav?: boolean;
}) {
  const activeCustomerId = useChoufStore((s) => s.activeCustomerId);
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NotificationToasts audience="customer" audienceId={activeCustomerId} />
      {!noTopBar && <CustomerTopBar title={title} showBack={showBack} />}
      <div className="flex-1">{children}</div>
      {!noBottomNav && <CustomerBottomNav />}
    </div>
  );
}
