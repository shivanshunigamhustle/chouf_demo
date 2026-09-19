"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { Card, CardBody, Avatar, Select, Badge } from "@/components/ui/Primitives";
import { RatingBadge } from "@/components/ui/RatingStars";
import { MapPin, Globe2, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { t, locale } = useT();
  const setLocale = useChoufStore((s) => s.setLocale);
  const customers = useChoufStore((s) => s.customers);
  const activeCustomerId = useChoufStore((s) => s.activeCustomerId);
  const setActiveCustomer = useChoufStore((s) => s.setActiveCustomer);
  const customer = customers.find((c) => c.id === activeCustomerId)!;

  return (
    <CustomerScreen title={t("nav.profile")}>
      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardBody className="flex items-center gap-3 pt-5">
            <Avatar name={customer.name} color={customer.avatarColor} size={56} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink-900">{locale === "ar" ? customer.nameAr : customer.name}</p>
              <p className="text-xs text-ink-400">{customer.phone}</p>
              <div className="mt-1"><RatingBadge rating={customer.rating} /></div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Demo: switch customer</p>
            <Select value={activeCustomerId} onChange={(e) => setActiveCustomer(e.target.value)}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900"><MapPin className="h-4 w-4 text-brand-500" /> Addresses</p>
              <button className="text-xs font-semibold text-brand-600">{t("customer.addAddress")}</button>
            </div>
            <div className="flex flex-col gap-2">
              {customer.addresses.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-ink-200 px-3.5 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{a.label}</p>
                    <p className="text-xs text-ink-400">{a.line1}</p>
                  </div>
                  {!a.zoneId && <Badge tone="danger">No coverage</Badge>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="flex w-full items-center justify-between py-1"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900"><Globe2 className="h-4 w-4 text-brand-500" /> {t("common.language")}</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-ink-500">{locale === "en" ? "English" : "العربية"} <ChevronRight className="h-3.5 w-3.5" /></span>
            </button>
          </CardBody>
        </Card>

        <Link href="/">
          <Card>
            <CardBody className="flex items-center gap-1.5 pt-5 text-sm font-semibold text-danger-600">
              <LogOut className="h-4 w-4" /> {t("common.logout")}
            </CardBody>
          </Card>
        </Link>
      </div>
    </CustomerScreen>
  );
}
