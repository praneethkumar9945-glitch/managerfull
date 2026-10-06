import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "admin" | "principal" | "hr" | "academic" | "admissions"
  | "sales" | "marketing" | "governance" | "staff";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrator", principal: "Principal", hr: "HR", academic: "Academic",
  admissions: "Admissions", sales: "Sales", marketing: "Marketing",
  governance: "Governance", staff: "Staff",
};

// Which menu paths each role can open. Admin and principal see everything.
const ROLE_PATHS: Record<AppRole, string[] | "all"> = {
  admin: "all",
  principal: "all",
  hr: ["/", "/hr", "/workspace"],
  academic: ["/", "/academic", "/students", "/exams", "/college", "/workspace"],
  admissions: ["/", "/admission", "/crm", "/students", "/fees", "/workspace"],
  sales: ["/", "/sales", "/crm", "/workspace"],
  marketing: ["/", "/marketing", "/crm", "/workspace"],
  governance: ["/", "/governance", "/ai", "/workspace"],
  staff: ["/", "/workspace"],
};

export function canAccess(roles: AppRole[], path: string) {
  return roles.some((r) => {
    const p = ROLE_PATHS[r];
    if (p === "all") return true;
    return p.some((base) => (base === "/" ? path === "/" : path === base || path.startsWith(base + "/")));
  });
}

type AuthState = { user: User | null; roles: AppRole[]; loading: boolean };
const Ctx = createContext<AuthState>({ user: null, roles: [], loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, roles: [], loading: true });

  useEffect(() => {
    const load = async (user: User | null) => {
      if (!user) return setState({ user: null, roles: [], loading: false });
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setState({ user, roles: (data ?? []).map((r) => r.role as AppRole), loading: false });
    };
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setTimeout(() => load(session?.user ?? null), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
