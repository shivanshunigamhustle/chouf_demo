"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Label, Input } from "@/components/ui/Primitives";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@chouf.demo");

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-7 text-white">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-800 text-white"><ShieldCheck className="h-5.5 w-5.5" /></div>
        <h1 className="mt-5 text-xl font-black">Admin Console</h1>
        <p className="mt-1 text-sm text-white/50">Operations, dispatch & configuration.</p>
        <div className="mt-6">
          <Label className="text-white/70">Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="border-white/10 bg-white/5 text-white" />
          <Label className="mt-3 text-white/70">Password</Label>
          <Input type="password" defaultValue="demo1234" className="border-white/10 bg-white/5 text-white" />
        </div>
        <Button size="lg" className="mt-6 w-full bg-white text-ink-900 hover:bg-white/90" onClick={() => router.push("/admin/dashboard")}>
          Sign in
        </Button>
      </div>
    </div>
  );
}
