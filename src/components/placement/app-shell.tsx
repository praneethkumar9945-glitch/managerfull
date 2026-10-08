// @ts-nocheck
import { Link, useRouterState } from "@tanstack/react-router";
import { icons, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ROLES, SECTIONS, type RoleId } from "@/components/placement/lib/config";
import { cn } from "@/lib/utils";

export function AppShell({ role, children }: { role: RoleId; children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const r = ROLES[role];
  const base = `/placement/${role}`;
  const tab = (active: boolean) =>
    cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/placement" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Switch role</Link>
          <h1 className="text-xl font-semibold">Placements · {r.label}</h1>
        </div>
        <div className="text-right text-sm"><div className="font-medium">{r.person}</div><div className="text-xs text-muted-foreground">{r.label}</div></div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b pb-2">
        <Link to="/placement/$role" params={{ role }} className={tab(path === base)}><LayoutDashboard className="size-4" />Dashboard</Link>
        {r.nav.map((s) => { const I = icons[SECTIONS[s].icon] ?? icons.Circle; return (
          <Link key={s} to="/placement/$role/$section" params={{ role, section: s }} className={tab(path.startsWith(`${base}/${s}`))}><I className="size-4" />{SECTIONS[s].title}</Link>
        ); })}
      </nav>
      <div>{children}</div>
      <Toaster />
    </div>
  );
}
