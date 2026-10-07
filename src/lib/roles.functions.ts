import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const claimableRoles = [
  "principal", "hr", "academic", "admissions",
  "sales", "marketing", "governance", "staff",
] as const;

// Assigns a role to a signed-in user who has none yet.
// The very first user in the system becomes Administrator.
// Administrator can never be self-claimed — only granted by an existing admin.
export const claimRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ role: z.enum(claimableRoles).nullable() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    if (existing && existing.length > 0) return { assigned: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: admins } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    const role = !admins || admins.length === 0 ? "admin" : (data.role ?? "staff");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role });
    if (error) throw new Error(error.message);

    return { assigned: true, role };
  });
