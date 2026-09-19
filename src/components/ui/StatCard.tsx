import { Card, CardBody } from "./Primitives";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tone = "brand",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta?: number;
  tone?: "brand" | "teal" | "info" | "success" | "warning";
}) {
  const tones: Record<string, string> = {
    brand: "bg-gradient-to-br from-brand-400 to-brand-600",
    teal: "bg-gradient-to-br from-teal-400 to-teal-600",
    info: "bg-gradient-to-br from-info-500 to-blue-700",
    success: "bg-gradient-to-br from-success-500 to-emerald-700",
    warning: "bg-gradient-to-br from-warning-500 to-orange-600",
  };
  return (
    <Card className="group hover:shadow-soft">
      <CardBody className="pt-5">
        <div className="flex items-center justify-between">
          <span
            className={cn("flex h-10 w-10 items-center justify-center rounded-[14px] text-white shadow-icon", tones[tone])}
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </span>
          {delta !== undefined && (
            <span className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold", delta >= 0 ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-500")}>
              {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
        <p className="font-display mt-3.5 text-[26px] font-extrabold leading-none tracking-tight text-ink-900">{value}</p>
        <p className="mt-1.5 text-xs font-medium text-ink-400">{label}</p>
      </CardBody>
    </Card>
  );
}
