"use client";

import { useChoufStore } from "@/lib/store";
import { Card, CardBody, CardHeader, Label, Input, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { CreditCard, Bell, Boxes, Puzzle, RefreshCw } from "lucide-react";

export default function AdminSettings() {
  const resetDemoData = useChoufStore((s) => s.resetDemoData);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-black text-ink-900">Settings</h1>

      <Card>
        <CardHeader><h2 className="text-sm font-bold text-ink-900">Platform</h2></CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
          <div><Label>Platform name</Label><Input defaultValue="Chouf" /></div>
          <div><Label>Support email</Label><Input defaultValue="support@chouf.demo" /></div>
          <div><Label>Default currency</Label><Input defaultValue="AED" /></div>
          <div><Label>Default city</Label><Input defaultValue="Al Marsa" /></div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h2 className="flex items-center gap-2 text-sm font-bold text-ink-900"><CreditCard className="h-4 w-4 text-brand-500" /> Payments</h2></CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">Cash on Delivery</p>
              <p className="text-xs text-ink-400">Only payment method enabled in this demo</p>
            </div>
            <Badge tone="success">Active</Badge>
          </div>
          {["Online card payments", "Wallet", "Apple Pay / Google Pay"].map((p) => (
            <div key={p} className="mt-2 flex items-center justify-between rounded-xl border border-dashed border-ink-200 px-4 py-3 opacity-60">
              <p className="text-sm font-semibold text-ink-500">{p}</p>
              <Badge tone="neutral">Coming soon</Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h2 className="flex items-center gap-2 text-sm font-bold text-ink-900"><Bell className="h-4 w-4 text-brand-500" /> Notifications</h2></CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">In-app toasts</p>
              <p className="text-xs text-ink-400">Simulated in this demo in place of push notifications</p>
            </div>
            <Badge tone="success">Active</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-dashed border-ink-200 px-4 py-3 opacity-60">
            <p className="text-sm font-semibold text-ink-500">Firebase Cloud Messaging (push)</p>
            <Badge tone="neutral">Coming soon</Badge>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><h2 className="flex items-center gap-2 text-sm font-bold text-ink-900"><Puzzle className="h-4 w-4 text-brand-500" /> Integrations</h2></CardHeader>
        <CardBody className="pt-0">
          {["POS / ERP sync", "Multi-city expansion"].map((p) => (
            <div key={p} className="mb-2 flex items-center justify-between rounded-xl border border-dashed border-ink-200 px-4 py-3 opacity-60 last:mb-0">
              <p className="text-sm font-semibold text-ink-500">{p}</p>
              <Badge tone="neutral">Coming soon</Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card className="border-danger-200">
        <CardHeader><h2 className="flex items-center gap-2 text-sm font-bold text-ink-900"><Boxes className="h-4 w-4 text-danger-500" /> Demo data</h2></CardHeader>
        <CardBody className="flex items-center justify-between pt-0">
          <p className="text-xs text-ink-400">Reset all seeded orders, drivers and notifications back to their original demo state.</p>
          <Button variant="outline" onClick={resetDemoData}><RefreshCw className="h-3.5 w-3.5" /> Reset demo</Button>
        </CardBody>
      </Card>
    </div>
  );
}
