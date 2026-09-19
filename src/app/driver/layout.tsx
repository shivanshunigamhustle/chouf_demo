import { StandaloneAppFrame } from "@/components/device-frame/StandaloneAppFrame";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <StandaloneAppFrame>{children}</StandaloneAppFrame>;
}
