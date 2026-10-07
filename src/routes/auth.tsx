import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { School } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { claimRole } from "@/lib/roles.functions";
import { ROLE_LABELS, type AppRole } from "@/lib/auth";

const SIGNUP_ROLES = (Object.keys(ROLE_LABELS) as AppRole[]).filter((r) => r !== "admin");

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Edusphere" },
      { name: "description", content: "Sign in to the Edusphere college management portal with your staff account." },
      { property: "og:title", content: "Sign in — Edusphere" },
      { property: "og:description", content: "Sign in to the Edusphere college management portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AppRole>("staff");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const afterSignIn = async () => {
      const pending = window.localStorage.getItem("pending_role") as AppRole | null;
      try {
        await claimRole({ data: { role: pending && pending !== "admin" ? pending : null } });
      } catch {
        // role claim is best-effort; an admin can assign roles later
      }
      window.localStorage.removeItem("pending_role");
      navigate({ to: "/", replace: true });
    };
    supabase.auth.getUser().then(({ data }) => data.user && afterSignIn());
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) afterSignIn();
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      window.localStorage.setItem("pending_role", role);
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      setMsg(error ? error.message : "Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg(String(r.error.message ?? r.error));
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-lg gradient-primary grid place-items-center text-primary-foreground">
            <School className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Edusphere</h1>
            <p className="text-xs text-muted-foreground">{mode === "in" ? "Sign in to your account" : "Create a staff account"}</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && (
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" minLength={6} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={busy} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-60">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button onClick={google} className="mt-3 w-full rounded-md border py-2 text-sm font-medium hover:bg-muted">
          Continue with Google
        </button>
        {msg && <p className="mt-3 text-xs text-muted-foreground">{msg}</p>}
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-xs text-primary hover:underline">
          {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
