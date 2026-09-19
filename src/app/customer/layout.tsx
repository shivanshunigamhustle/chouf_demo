import { StandaloneAppFrame } from "@/components/device-frame/StandaloneAppFrame";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <StandaloneAppFrame>{children}</StandaloneAppFrame>;
}
