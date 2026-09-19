"use client";

import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Card, CardBody, Select } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUS_FLOW, type OrderStatus } from "@/lib/types";
import { PlayCircle, PauseCircle, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoControl({ orderId }: { orderId: string }) {
  const { t } = useT();
  const order = useChoufStore((s) => s.orders.find((o) => o.id === orderId));
  const advanceOrder = useChoufStore((s) => s.advanceOrder);
  const setOrderStatus = useChoufStore((s) => s.setOrderStatus);
  const autoPlay = useChoufStore((s) => s.autoPlay);
  const toggleAutoPlay = useChoufStore((s) => s.toggleAutoPlay);

  if (!order) return null;
  const isTerminal = order.status === "delivered" || order.status === "cancelled" || order.status === "rejected";
  const idx = ORDER_STATUS_FLOW.indexOf(order.status);
  const next = idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[idx + 1] : null;

  return (
    <Card className="border-2 border-dashed border-brand-300 bg-brand-50/30">
      <CardBody className="pt-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-ink-900">🎬 {t("admin.demoControl")}</p>
          <button
            onClick={toggleAutoPlay}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              autoPlay ? "bg-brand-500 text-white" : "bg-white text-ink-600 border border-ink-200"
            )}
          >
            {autoPlay ? <PauseCircle className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
            {t("admin.autoPlay")}
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-ink-500">Current:</span>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          {!isTerminal && next && (
            <Button size="sm" onClick={() => advanceOrder(orderId)}>
              <SkipForward className="h-3.5 w-3.5" /> {t("admin.advance")} → {t(`status.${next}`)}
            </Button>
          )}
          {order.status === "placed" && (
            <Button size="sm" variant="outline" onClick={() => setOrderStatus(orderId, "rejected")}>
              Reject order
            </Button>
          )}
          {!isTerminal && (
            <Button size="sm" variant="outline" onClick={() => setOrderStatus(orderId, "cancelled")}>
              Cancel order
            </Button>
          )}
          {isTerminal && (
            <Button size="sm" variant="outline" onClick={() => setOrderStatus(orderId, "placed")}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset to placed
            </Button>
          )}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-ink-500">Jump to any status</label>
          <Select
            value={order.status}
            onChange={(e) => setOrderStatus(orderId, e.target.value as OrderStatus)}
          >
            {(["placed", "accepted", "preparing", "ready", "driver_assigned", "picked_up", "on_the_way", "delivered", "cancelled", "rejected"] as OrderStatus[]).map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </Select>
        </div>
      </CardBody>
    </Card>
  );
}
