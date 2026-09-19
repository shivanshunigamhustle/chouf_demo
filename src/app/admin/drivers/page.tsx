"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Avatar, Select } from "@/components/ui/Primitives";
import { RatingBadge } from "@/components/ui/RatingStars";
import { formatCurrency } from "@/lib/utils";
import type { Driver } from "@/lib/types";

export default function AdminDrivers() {
  const { locale } = useT();
  const drivers = useChoufStore((s) => s.drivers);
  const zones = useChoufStore((s) => s.zones);
  const setDriverStatus = useChoufStore((s) => s.setDriverStatus);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-black text-ink-900">Drivers</h1>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm rtl:text-right">
              <thead>
                <tr className="border-b border-ink-100 text-xs text-ink-400">
                  <th className="px-4 py-3 font-semibold">Driver</th>
                  <th className="px-4 py-3 font-semibold">Zone</th>
                  <th className="px-4 py-3 font-semibold">Vehicle</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Deliveries</th>
                  <th className="px-4 py-3 font-semibold">Earnings</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const zone = zones.find((z) => z.id === d.zoneId);
                  return (
                    <tr key={d.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={d.name} color={d.avatarColor} size={32} />
                          <div>
                            <p className="font-bold text-ink-900">{locale === "ar" ? d.nameAr : d.name}</p>
                            <p className="text-xs text-ink-400">{d.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-600">{locale === "ar" ? zone?.nameAr : zone?.name}</td>
                      <td className="px-4 py-3 capitalize text-ink-600">{d.vehicle}</td>
                      <td className="px-4 py-3"><RatingBadge rating={d.rating} /></td>
                      <td className="px-4 py-3 text-ink-600">{d.totalDeliveries}</td>
                      <td className="px-4 py-3 font-semibold text-ink-800">{formatCurrency(d.todayEarnings, locale)}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={d.status}
                          onChange={(e) => setDriverStatus(d.id, e.target.value as Driver["status"])}
                          className="h-8 w-36 text-xs"
                        >
                          <option value="active">Active</option>
                          <option value="on_delivery">On delivery</option>
                          <option value="inactive">Inactive</option>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
