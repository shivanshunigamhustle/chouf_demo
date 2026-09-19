"use client";

import { useState } from "react";
import { Card, CardBody, Badge, Avatar, Switch } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

const SEED_USERS = [
  { id: "u1", name: "Layla Haddad", email: "layla.admin@chouf.demo", role: "super_admin", active: true, color: "#ff5a1f" },
  { id: "u2", name: "Omar Faris", email: "omar.ops@chouf.demo", role: "ops", active: true, color: "#0ea5a4" },
  { id: "u3", name: "Sara Khalil", email: "sara.support@chouf.demo", role: "support", active: true, color: "#2563eb" },
  { id: "u4", name: "Karim Aziz", email: "karim.finance@chouf.demo", role: "finance", active: false, color: "#d97706" },
];

const ROLE_TONE: Record<string, "brand" | "teal" | "info" | "warning"> = {
  super_admin: "brand",
  ops: "teal",
  support: "info",
  finance: "warning",
};

export default function AdminUsers() {
  const [users, setUsers] = useState(SEED_USERS);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ink-900">Users & roles</h1>
        <Button size="sm"><Plus className="h-4 w-4" /> Invite user</Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="flex flex-col divide-y divide-ink-100">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} color={u.color} />
                  <div>
                    <p className="text-sm font-bold text-ink-900">{u.name}</p>
                    <p className="text-xs text-ink-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={ROLE_TONE[u.role]}>{u.role.replace("_", " ")}</Badge>
                  <Switch
                    checked={u.active}
                    onChange={() => setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)))}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
