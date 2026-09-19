"use client";

import { useState } from "react";
import { DeviceFrame, type FrameVariant } from "@/components/device-frame/DeviceFrame";
import { FrameSwitcher } from "@/components/device-frame/FrameSwitcher";
import { OrderDetail } from "@/app/customer/orders/[id]/page";
import { DeliveryDetail } from "@/app/driver/delivery/[id]/page";
import { useT } from "@/lib/i18n/useT";

export function LiveDeviceView({ orderId }: { orderId: string }) {
  const { t } = useT();
  const [customerVariant, setCustomerVariant] = useState<FrameVariant>("ios");
  const [driverVariant, setDriverVariant] = useState<FrameVariant>("android");

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{t("admin.whatCustomerSees")}</p>
        </div>
        <FrameSwitcher value={customerVariant} onChange={setCustomerVariant} />
        <DeviceFrame variant={customerVariant} displayWidth={260} suppressOnMobile={false}>
          <OrderDetail id={orderId} />
        </DeviceFrame>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">{t("admin.whatDriverSees")}</p>
        <FrameSwitcher value={driverVariant} onChange={setDriverVariant} />
        <DeviceFrame variant={driverVariant} displayWidth={260} suppressOnMobile={false}>
          <DeliveryDetail id={orderId} />
        </DeviceFrame>
      </div>
    </div>
  );
}
