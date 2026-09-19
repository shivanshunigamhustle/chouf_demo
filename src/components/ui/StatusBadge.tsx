import { Badge } from "./Primitives";
import { useT } from "@/lib/i18n/useT";
import type { OrderStatus } from "@/lib/types";
import {
  CheckCircle2,
  ChefHat,
  ClipboardCheck,
  PackageCheck,
  Bike,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";

const TONE: Record<OrderStatus, "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "teal"> = {
  placed: "info",
  accepted: "brand",
  preparing: "warning",
  ready: "teal",
  driver_assigned: "teal",
  picked_up: "teal",
  on_the_way: "brand",
  delivered: "success",
  cancelled: "danger",
  rejected: "danger",
};

const ICON: Record<OrderStatus, React.ElementType> = {
  placed: Clock,
  accepted: ClipboardCheck,
  preparing: ChefHat,
  ready: PackageCheck,
  driver_assigned: Bike,
  picked_up: PackageCheck,
  on_the_way: Bike,
  delivered: CheckCircle2,
  cancelled: XCircle,
  rejected: Ban,
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { t } = useT();
  const Icon = ICON[status];
  return (
    <Badge tone={TONE[status]} className={className}>
      <Icon className="h-3.5 w-3.5" />
      {t(`status.${status}`)}
    </Badge>
  );
}
