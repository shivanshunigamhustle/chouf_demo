"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Wifi, SignalHigh, BatteryFull } from "lucide-react";

export type FrameVariant = "ios" | "android";

const SIZES: Record<FrameVariant, { w: number; h: number }> = {
  ios: { w: 390, h: 844 },
  android: { w: 412, h: 915 },
};

function useNow() {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", ""));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function IosStatusBar() {
  const time = useNow();
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-11 items-center justify-between px-7 pt-1.5 text-[13px] font-semibold text-ink-900">
      <span>{time}</span>
      <div className="absolute left-1/2 top-1.5 h-[28px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-1.5">
        <SignalHigh className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </div>
    </div>
  );
}

function AndroidStatusBar() {
  const time = useNow();
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-8 items-center justify-between px-5 text-[12px] font-medium text-ink-900">
      <span>{time}</span>
      <div className="absolute left-1/2 top-1.5 h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-1.5">
        <SignalHigh className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </div>
    </div>
  );
}

function IosHomeIndicator() {
  return <div className="absolute bottom-1.5 left-1/2 z-20 h-1 w-32 -translate-x-1/2 rounded-full bg-black/80" />;
}

function AndroidNavBar() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex h-7 items-center justify-center gap-16 pb-1">
      <div className="h-1 w-6 rounded-full bg-black/40" />
    </div>
  );
}

function useIsNarrowViewport() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

export function DeviceFrame({
  variant,
  children,
  displayWidth = 300,
  className,
  suppressOnMobile = true,
}: {
  variant: FrameVariant;
  children: React.ReactNode;
  displayWidth?: number;
  className?: string;
  suppressOnMobile?: boolean;
}) {
  const { w, h } = SIZES[variant];
  const scale = displayWidth / w;
  const displayHeight = h * scale;
  const isNarrow = useIsNarrowViewport();

  if (suppressOnMobile && isNarrow) {
    return <div className={cn("w-full", className)}>{children}</div>;
  }

  return (
    <div
      className={cn("relative mx-auto select-none", className)}
      style={{ width: displayWidth, height: displayHeight }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: w, height: h, transform: `scale(${scale})` }}
      >
        {variant === "ios" ? (
          <div className="relative h-full w-full rounded-[54px] bg-ink-950 p-[14px] shadow-pop">
            <div className="absolute -right-[2px] top-[124px] h-[70px] w-[3px] rounded-l bg-ink-800" />
            <div className="absolute -left-[2px] top-[100px] h-[32px] w-[3px] rounded-r bg-ink-800" />
            <div className="absolute -left-[2px] top-[150px] h-[62px] w-[3px] rounded-r bg-ink-800" />
            <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-white">
              <IosStatusBar />
              <div className="h-full w-full overflow-y-auto overflow-x-hidden pt-11">{children}</div>
              <IosHomeIndicator />
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full rounded-[34px] bg-ink-950 p-[10px] shadow-pop">
            <div className="absolute -right-[2px] top-[140px] h-[80px] w-[3px] rounded-l bg-ink-800" />
            <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-white">
              <AndroidStatusBar />
              <div className="h-full w-full overflow-y-auto overflow-x-hidden pt-8">{children}</div>
              <AndroidNavBar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
