"use client";

import Link from "next/link";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { DriverScreen } from "@/components/layout/DriverChrome";
import { Card, CardBody, Avatar, Badge } from "@/components/ui/Primitives";
import { RatingBadge } from "@/components/ui/RatingStars";
import { Bike, LogOut, ShieldCheck } from "lucide-react";

export default function DriverProfile() {
  const { t, locale } = useT();
  const driver = useChoufStore((s) => s.drivers.find((d) => d.id === s.activeDriverId))!;

  return (
    <DriverScreen title={t("nav.profile")}>
      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardBody className="flex items-center gap-3 pt-5">
            <Avatar name={driver.name} color={driver.avatarColor} size={56} />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink-900">{locale === "ar" ? driver.nameAr : driver.name}</p>
              <p className="text-xs text-ink-400">{driver.phone}</p>
              <div className="mt-1"><RatingBadge rating={driver.rating} /></div>
            </div>
            <Badge tone={driver.status === "active" ? "success" : driver.status === "on_delivery" ? "teal" : "neutral"}>
              {driver.status.replace("_", " ")}
            </Badge>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 pt-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600"><Bike className="h-4.5 w-4.5" /></span>
            <div>
              <p className="text-sm font-bold capitalize text-ink-900">{driver.vehicle}</p>
              <p className="text-xs text-ink-400">Plate {driver.plate}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 pt-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-info-50 text-info-600"><ShieldCheck className="h-4.5 w-4.5" /></span>
            <div>
              <p className="text-sm font-bold text-ink-900">{driver.totalDeliveries} lifetime deliveries</p>
              <p className="text-xs text-ink-400">Zone-verified · Documents up to date</p>
            </div>
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
    </DriverScreen>
  );
}
