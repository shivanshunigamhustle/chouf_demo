"use client";

import { useChoufStore } from "@/lib/store";
import { DeviceFrame } from "./DeviceFrame";
import { FrameSwitcher } from "./FrameSwitcher";

export function StandaloneAppFrame({ children }: { children: React.ReactNode }) {
  const variant = useChoufStore((s) => s.deviceFrameVariant);
  const setVariant = useChoufStore((s) => s.setDeviceFrameVariant);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_50%_0%,#1c2333,#0b0e16)] py-10">
      <div className="hidden sm:block">
        <FrameSwitcher value={variant} onChange={setVariant} />
      </div>
      <DeviceFrame variant={variant} displayWidth={390} suppressOnMobile>
        {children}
      </DeviceFrame>
    </div>
  );
}
