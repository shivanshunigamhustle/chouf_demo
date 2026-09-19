"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChoufStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Primitives";
import { ShieldCheck, Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const adminSession = useChoufStore((s) => s.adminSession);
  const adminLogin = useChoufStore((s) => s.adminLogin);
  const [email, setEmail] = useState("admin@chouf.demo");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminSession) router.replace("/admin/dashboard");
  }, [adminSession, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError("Enter your email address.");
    if (password.trim().length < 4) return setError("Password must be at least 4 characters.");
    setError("");
    setLoading(true);
    setTimeout(() => {
      adminLogin(email.trim(), email.split("@")[0].replace(/[._]/g, " "));
      router.push("/admin/dashboard");
    }, 500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-7 text-white">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-icon">
          <ShieldCheck className="h-5.5 w-5.5" />
        </div>
        <h1 className="mt-5 text-xl font-black">Admin Console</h1>
        <p className="mt-1 text-sm text-white/50">Operations, dispatch & configuration.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <Label className="flex items-center gap-1 text-white/70"><Mail className="h-3 w-3" /> Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1 text-white/70"><Lock className="h-3 w-3" /> Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
            <p className="mt-1.5 text-[11px] text-white/30">Demo: any password with 4+ characters works.</p>
          </div>
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-danger-400">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-5 w-full bg-white text-ink-900 hover:bg-white/90" loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
