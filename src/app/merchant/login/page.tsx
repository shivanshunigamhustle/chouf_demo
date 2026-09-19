"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Button } from "@/components/ui/Button";
import { Label, Select, Input } from "@/components/ui/Primitives";
import { Store, Lock, Mail, AlertCircle } from "lucide-react";

export default function MerchantLogin() {
  const router = useRouter();
  const { t } = useT();
  const merchants = useChoufStore((s) => s.merchants);
  const merchantSession = useChoufStore((s) => s.merchantSession);
  const merchantLogin = useChoufStore((s) => s.merchantLogin);
  const [merchantId, setMerchantId] = useState(merchants[0]?.id ?? "");
  const [email, setEmail] = useState("owner@baytnakitchen.demo");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (merchantSession) router.replace("/merchant/dashboard");
  }, [merchantSession, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError("Enter your email address.");
    if (password.trim().length < 4) return setError("Password must be at least 4 characters.");
    setError("");
    setLoading(true);
    const merchant = merchants.find((m) => m.id === merchantId);
    setTimeout(() => {
      merchantLogin(merchantId, merchant ? `${merchant.name} Owner` : "Store Manager");
      router.push("/merchant/dashboard");
    }, 500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl border border-ink-200 bg-white p-7 shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-icon">
          <Store className="h-5.5 w-5.5" />
        </div>
        <h1 className="mt-5 text-xl font-black text-ink-900">Merchant Login</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in to manage your storefront.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <Label>Business</Label>
            <Select value={merchantId} onChange={(e) => setMerchantId(e.target.value)}>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
          </div>
          <div>
            <Label className="flex items-center gap-1"><Lock className="h-3 w-3" /> Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <p className="mt-1.5 text-[11px] text-ink-400">Demo: any password with 4+ characters works.</p>
          </div>
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-danger-500">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-5 w-full" loading={loading}>
          {t("common.login")}
        </Button>
      </form>
    </div>
  );
}
