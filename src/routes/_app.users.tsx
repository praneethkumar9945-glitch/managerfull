import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_app/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — Edusphere" },
      { name: "description", content: "Manage staff accounts and the roles that control which sections they can open." },
      { property: "og:title", content: "Users & Roles — Edusphere" },
      { property: "og:description", content: "Manage staff accounts and roles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsersPage,
});

type Row = { id: string; full_name: string | null; email: string | null; roles: AppRole[] };
const ALL = Object.keys(ROLE_LABELS) as AppRole[];

function UsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").order("created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setRows((p ?? []).map((x) => ({ ...x, roles: (r ?? []).filter((y) => y.user_id === x.id).map((y) => y.role as AppRole) })));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (userId: string, role: AppRole, has: boolean) => {
    setErr(null);
    const { error } = has
      ? await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role)
      : await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) setErr(error.message);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Users & Roles</h1>
        <p className="text-sm text-muted-foreground">Tick a role to give a person access to that part of the portal.</p>
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Name</th>{ALL.map((r) => <th key={r} className="p-3 text-xs font-medium">{ROLE_LABELS[r]}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3"><div className="font-medium">{u.full_name}</div><div className="text-xs text-muted-foreground">{u.email}</div></td>
                {ALL.map((r) => {
                  const has = u.roles.includes(r);
                  return <td key={r} className="p-3 text-center"><input type="checkbox" checked={has} onChange={() => toggle(u.id, r, has)} /></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
