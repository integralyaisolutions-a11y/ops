"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/database.types";

export async function inviteTeamMember(email: string, role: Role) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No has iniciado sesión." };

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!myProfile || myProfile.role !== "admin") {
    return { error: "Solo un administrador puede añadir personas." };
  }

  const admin = createAdminClient();

  // ¿Ya existe una cuenta con este email? Si es así, no hace falta invitar
  // de nuevo — solo darle acceso a la app.
  const { data: existing } = await admin.auth.admin.listUsers();
  const already = existing?.users?.find(
    (u: { email?: string }) => u.email?.toLowerCase() === email.trim().toLowerCase(),
  );

  let userId: string;
  if (already) {
    userId = already.id;
  } else {
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      email.trim(),
    );
    if (inviteErr || !invited?.user) {
      return { error: inviteErr?.message || "No se pudo invitar a esta persona." };
    }
    userId = invited.user.id;
  }

  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert({ id: userId, role, added_by: user.id }, { onConflict: "id" });
  if (upsertErr) {
    return { error: "Invitación enviada, pero no se pudo asignar el rol: " + upsertErr.message };
  }

  return { ok: true };
}
