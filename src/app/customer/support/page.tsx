"use client";

import { useShallow } from "zustand/react/shallow";
import { useChoufStore } from "@/lib/store";
import { CustomerScreen } from "@/components/layout/CustomerChrome";
import { Card, CardBody, Badge } from "@/components/ui/Primitives";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { useT } from "@/lib/i18n/useT";
import { HelpCircle, MessageSquarePlus } from "lucide-react";

const TONE: Record<string, "warning" | "info" | "success"> = { open: "warning", pending: "info", resolved: "success" };

export default function SupportPage() {
  const { t, locale } = useT();
  const tickets = useChoufStore(useShallow((s) => s.supportTickets.filter((tk) => tk.customerId === s.activeCustomerId)));
  const orders = useChoufStore(useShallow((s) => s.orders.filter((o) => o.customerId === s.activeCustomerId)));

  const faqs = [
    { q: "Where is my order?", a: "Track live status and driver location from the Orders tab." },
    { q: "How do I get a refund?", a: "Open a support ticket referencing your order code and our team will follow up." },
    { q: "Can I change my delivery address?", a: "Addresses can be edited any time before an order is accepted from your Profile." },
  ];

  return (
    <CustomerScreen title={t("nav.support")}>
      <div className="flex flex-col gap-4 p-4">
        <button className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-soft">
          <MessageSquarePlus className="h-4.5 w-4.5" /> New support ticket
        </button>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">Your tickets</p>
          <div className="flex flex-col gap-2">
            {tickets.length === 0 && <p className="text-xs text-ink-400">No tickets yet.</p>}
            {tickets.map((tk) => {
              const order = orders.find((o) => o.id === tk.orderId);
              return (
                <Card key={tk.id}>
                  <CardBody className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900">{tk.subject}</p>
                      <Badge tone={TONE[tk.status]}>{tk.status}</Badge>
                    </div>
                    {order && <p className="mt-1 text-xs text-ink-400">Order {order.code} · {formatCurrency(order.total, locale)}</p>}
                    <p className="mt-1 text-xs text-ink-400">{timeAgo(tk.createdAt, locale)}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
            <HelpCircle className="h-3.5 w-3.5" /> FAQs
          </p>
          <div className="flex flex-col gap-2">
            {faqs.map((f, i) => (
              <Card key={i}>
                <CardBody className="pt-4">
                  <p className="text-sm font-semibold text-ink-900">{f.q}</p>
                  <p className="mt-1 text-xs text-ink-500">{f.a}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </CustomerScreen>
  );
}
