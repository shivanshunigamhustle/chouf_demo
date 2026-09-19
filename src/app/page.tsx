"use client";

import Link from "next/link";
import { ShoppingBag, Bike, Store, ShieldCheck, ArrowUpRight, Globe2, MapPin, Star, Package } from "lucide-react";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { HeroLiveDemo } from "@/components/landing/HeroLiveDemo";
import { MerchantMarquee } from "@/components/landing/MerchantMarquee";

const PORTALS = [
  {
    href: "/customer/home",
    icon: ShoppingBag,
    title: "Customer app",
    titleAr: "تطبيق العميل",
    desc: "Browse merchants, order food & groceries, and track delivery live.",
    iconColor: "from-brand-400 to-brand-600",
    border: "border-brand-200 hover:border-brand-400",
    glow: "group-hover:shadow-[0_16px_40px_-16px_theme(colors.brand.400)]",
  },
  {
    href: "/driver/home",
    icon: Bike,
    title: "Driver app",
    titleAr: "تطبيق السائق",
    desc: "Go online, accept deliveries, navigate, and confirm drop-off.",
    iconColor: "from-teal-400 to-teal-600",
    border: "border-teal-200 hover:border-teal-400",
    glow: "group-hover:shadow-[0_16px_40px_-16px_theme(colors.teal.400)]",
  },
  {
    href: "/merchant/dashboard",
    icon: Store,
    title: "Merchant dashboard",
    titleAr: "لوحة التاجر",
    desc: "Manage orders, menu, availability and branch performance.",
    iconColor: "from-blue-400 to-blue-600",
    border: "border-blue-200 hover:border-blue-400",
    glow: "group-hover:shadow-[0_16px_40px_-16px_theme(colors.blue.400)]",
  },
  {
    href: "/admin/dashboard",
    icon: ShieldCheck,
    title: "Admin dashboard",
    titleAr: "لوحة الإدارة",
    desc: "Dispatch drivers, configure zones & fees, and run the demo.",
    iconColor: "from-violet-500 to-violet-700",
    border: "border-violet-200 hover:border-violet-400",
    glow: "group-hover:shadow-[0_16px_40px_-16px_theme(colors.violet.400)]",
  },
];

export default function Landing() {
  const locale = useChoufStore((s) => s.locale);
  const setLocale = useChoufStore((s) => s.setLocale);
  const { t } = useT();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-ink-50 text-ink-900">
      {/* decorative animated blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-brand-300/30 blur-3xl" />
        <div className="animate-blob-slow absolute right-[-8rem] top-10 h-[380px] w-[380px] rounded-full bg-teal-300/25 blur-3xl" />
        <div className="animate-blob absolute bottom-[-6rem] left-1/3 h-[360px] w-[360px] rounded-full bg-violet-300/20 blur-3xl [animation-delay:3s]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-black text-white shadow-icon">
              C
            </div>
            <span className="text-lg font-bold tracking-tight text-ink-900">{t("appName")}</span>
          </div>
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-600 shadow-card transition-colors hover:border-ink-300 hover:bg-ink-50"
          >
            <Globe2 className="h-3.5 w-3.5" />
            {locale === "en" ? "العربية" : "English"}
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-14 lg:mt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* left: copy */}
          <div className="relative max-w-2xl">
            <span className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
              Full-stack product demo
            </span>
            <h1 className="font-display animate-fade-in-up mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-900 [animation-delay:80ms] sm:text-6xl">
              One order,<br /> four live portals.
            </h1>
            <p className="animate-fade-in-up mt-5 text-lg leading-relaxed text-ink-500 [animation-delay:160ms]">
              Chouf is an on-demand delivery platform demo — a customer places an order, a merchant fulfills it, an
              admin dispatches a driver, and the whole journey plays out live across every screen, in real time, in
              one browser.
            </p>
          </div>

          {/* right: live animated demo, with floating decorative chips around it */}
          <div className="animate-fade-in-up relative mx-auto w-full max-w-sm [animation-delay:260ms]">
            <div
              className="animate-float-y absolute -left-7 -top-6 z-10 hidden h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-500 shadow-pop lg:flex"
              style={{ ["--float-r" as string]: "-8deg" }}
            >
              <Package className="h-5 w-5" />
            </div>
            <div
              className="animate-float-y absolute -right-5 top-1/3 z-10 hidden h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-500 shadow-pop lg:flex [animation-delay:1.2s]"
              style={{ ["--float-r" as string]: "6deg" }}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div
              className="animate-float-y absolute -bottom-5 -left-5 z-10 hidden h-10 w-10 items-center justify-center rounded-2xl bg-white text-warning-500 shadow-pop lg:flex [animation-delay:2.1s]"
              style={{ ["--float-r" as string]: "10deg" }}
            >
              <Star className="h-4.5 w-4.5 fill-warning-500" />
            </div>
            <HeroLiveDemo />
          </div>
        </div>

        <div className="mt-6">
          <MerchantMarquee />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PORTALS.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              className={cn(
                "animate-fade-in-up group relative overflow-hidden rounded-3xl border-2 bg-white p-7 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop",
                p.border,
                p.glow
              )}
              style={{ animationDelay: `${320 + i * 90}ms` }}
            >
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-icon", p.iconColor)}>
                <p.icon className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink-900">{locale === "ar" ? p.titleAr : p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{p.desc}</p>
              <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-ink-700">
                Enter
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 text-sm text-ink-500 shadow-card">
          <span className="font-semibold text-ink-800">Tip:</span>
          Open the Admin dashboard → Live Map to watch a driver move in real time, or use the Demo Control panel to
          step any order through its full lifecycle.
          <Link href="/preview/customer" className="ml-auto font-semibold text-brand-600 hover:text-brand-700">
            View mobile screen gallery →
          </Link>
        </div>
      </div>
    </main>
  );
}
