"use client";

import { useChoufStore } from "@/lib/store";
import { Card, CardBody, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";

const STATUS_TONE: Record<string, "warning" | "info" | "success"> = { open: "warning", pending: "info", resolved: "success" };
const PRIORITY_TONE: Record<string, "danger" | "warning" | "neutral"> = { high: "danger", medium: "warning", low: "neutral" };

export default function AdminSupport() {
  const tickets = useChoufStore((s) => s.supportTickets);
  const customers = useChoufStore((s) => s.customers);
  const orders = useChoufStore((s) => s.orders);
  const resolveTicket = useChoufStore((s) => s.resolveTicket);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-black text-ink-900">Support tickets</h1>
      <div className="flex flex-col gap-3">
        {tickets.map((tk) => {
          const customer = customers.find((c) => c.id === tk.customerId);
          const order = orders.find((o) => o.id === tk.orderId);
          return (
            <Card key={tk.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-ink-900">{tk.subject}</p>
                    <Badge tone={PRIORITY_TONE[tk.priority]}>{tk.priority}</Badge>
                    <Badge tone={STATUS_TONE[tk.status]}>{tk.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">
                    {customer?.name} {order && `· Order ${order.code}`} · {timeAgo(tk.createdAt)}
                  </p>
                </div>
                {tk.status !== "resolved" && (
                  <Button size="sm" variant="outline" onClick={() => resolveTicket(tk.id)}>Mark resolved</Button>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
