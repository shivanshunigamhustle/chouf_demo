"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export function AuthGate({
  authed,
  loginHref,
  children,
}: {
  authed: boolean;
  loginHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!authed) router.replace(loginHref);
  }, [authed, loginHref, router]);

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-950">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/40">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="text-xs font-medium text-white/30">Redirecting to sign in…</p>
      </div>
    );
  }

  return <>{children}</>;
}
