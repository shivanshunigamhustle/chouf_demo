"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Avatar, Badge } from "@/components/ui/Primitives";
import { RatingBadge } from "@/components/ui/RatingStars";

export default function AdminCustomers() {
  const { locale } = useT();
  const customers = useChoufStore((s) => s.customers);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-black text-ink-900">Customers</h1>
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm rtl:text-right">
              <thead>
                <tr className="border-b border-ink-100 text-xs text-ink-400">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Addresses</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} color={c.avatarColor} size={32} />
                        <p className="font-bold text-ink-900">{locale === "ar" ? c.nameAr : c.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{c.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.addresses.map((a) => (
                          <Badge key={a.id} tone={a.zoneId ? "neutral" : "danger"}>{a.label}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{c.totalOrders}</td>
                    <td className="px-4 py-3"><RatingBadge rating={c.rating} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
