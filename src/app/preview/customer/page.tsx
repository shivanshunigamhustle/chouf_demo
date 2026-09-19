"use client";

import { useState } from "react";
import Link from "next/link";
import { DeviceFrame, type FrameVariant } from "@/components/device-frame/DeviceFrame";
import { FrameSwitcher } from "@/components/device-frame/FrameSwitcher";
import { ArrowLeft } from "lucide-react";

const SCREENS = [
  { label: "Home", path: "/customer/home" },
  { label: "Merchant", path: "/customer/merchant/merchant-1" },
  { label: "Cart", path: "/customer/cart" },
  { label: "Checkout", path: "/customer/checkout" },
  { label: "Order tracking", path: "/customer/orders/order-9" },
  { label: "Order history", path: "/customer/orders" },
  { label: "Profile", path: "/customer/profile" },
  { label: "Support", path: "/customer/support" },
];

export default function CustomerPreviewGallery() {
  const [variant, setVariant] = useState<FrameVariant>("ios");

  return (
    <div className="min-h-screen bg-ink-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
            <h1 className="mt-2 text-2xl font-black">Customer app — screen gallery</h1>
            <p className="text-sm text-white/50">Every customer screen, live and interactive, inside a real device frame.</p>
          </div>
          <FrameSwitcher value={variant} onChange={setVariant} />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-10">
          {SCREENS.map((s) => (
            <div key={s.path} className="flex flex-col items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-white/40">{s.label}</p>
              <DeviceFrame variant={variant} displayWidth={230} suppressOnMobile={false}>
                <iframe src={s.path} className="h-full w-full border-0" title={s.label} />
              </DeviceFrame>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
