"use client";

import { useState } from "react";
import { useChoufStore } from "@/lib/store";
import { Card, CardBody, Badge, Switch, Label, Input, Select } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Sheet";
import type { Promo } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Ticket, ArrowLeft } from "lucide-react";

export default function AdminPromotions() {
  const promos = useChoufStore((s) => s.promos);
  const togglePromoActive = useChoufStore((s) => s.togglePromoActive);
  const addPromo = useChoufStore((s) => s.addPromo);

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<Promo["type"]>("percent");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("0");
  const [usageLimit, setUsageLimit] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");

  function reset() {
    setCode(""); setType("percent"); setValue("10"); setMinOrder("0"); setUsageLimit("100"); setExpiresAt(""); setError("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    const val = type === "free_delivery" ? 0 : Number(value);
    if (!clean) return setError("Enter a voucher code.");
    if (promos.some((p) => p.code.toUpperCase() === clean)) return setError("This code already exists.");
    if (type !== "free_delivery" && (!(val > 0) || (type === "percent" && val > 100))) return setError("Enter a valid discount value.");
    if (!(Number(usageLimit) > 0)) return setError("Usage limit must be greater than 0.");
    if (!expiresAt) return setError("Pick an expiry date.");
    addPromo({
      code: clean,
      type,
      value: val,
      minOrder: Number(minOrder) || 0,
      usageLimit: Math.floor(Number(usageLimit)),
      expiresAt: new Date(expiresAt).toISOString(),
    });
    reset();
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            aria-label="Back to dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-black text-ink-900">Promotions</h1>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New promo</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((p) => (
          <Card key={p.id}>
            <CardBody className="pt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Ticket className="h-4.5 w-4.5" /></span>
                  <div>
                    <p className="text-sm font-black tracking-wide text-ink-900">{p.code}</p>
                    <p className="text-xs text-ink-400">
                      {p.type === "percent" ? `${p.value}% off` : p.type === "fixed" ? `${formatCurrency(p.value, "en")} off` : "Free delivery"}
                    </p>
                  </div>
                </div>
                <Switch checked={p.active} onChange={() => togglePromoActive(p.id)} size="sm" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
                <span>Min order {formatCurrency(p.minOrder, "en")}</span>
                <Badge tone={p.usageCount >= p.usageLimit ? "danger" : "neutral"}>{p.usageCount}/{p.usageLimit} used</Badge>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (p.usageCount / p.usageLimit) * 100)}%` }} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="New promo voucher">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <Label>Voucher code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onChange={(e) => setType(e.target.value as Promo["type"])}>
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_delivery">Free delivery</option>
              </Select>
            </div>
            {type !== "free_delivery" && (
              <div>
                <Label>{type === "percent" ? "Discount (%)" : "Discount amount"}</Label>
                <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min order</Label>
              <Input type="number" min="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            </div>
            <div>
              <Label>Usage limit</Label>
              <Input type="number" min="1" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Expires on</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          {error && <p className="text-xs font-semibold text-danger-500">{error}</p>}
          <Button type="submit" size="lg" className="w-full">Create voucher</Button>
        </form>
      </Modal>
    </div>
  );
}
