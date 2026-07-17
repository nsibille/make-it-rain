"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/types";

type InviteRole = Extract<Enums<"project_role">, "annotator" | "observer">;

export interface InviteResult {
  ok: boolean;
  message: string;
}

/**
 * Invite par email : on retrouve le profil (RLS = même organisation), on
 * l'ajoute à project_members et on passe le projet en « partagé ».
 * L'écriture réelle est gardée par la RLS (members write = pmo).
 */
export async function inviteMember(
  projectId: string,
  email: string,
  role: InviteRole,
): Promise<InviteResult> {
  const clean = email.trim().toLowerCase();
  if (!clean) return { ok: false, message: "Renseignez un email." };

  const supabase = await createClient();

  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", clean)
    .maybeSingle();
  if (!prof) {
    return {
      ok: false,
      message:
        "Aucun compte trouvé pour cet email dans votre organisation. La personne doit d'abord se connecter au moins une fois.",
    };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .single();
  if (project?.owner_id === prof.id) {
    return { ok: false, message: "Cette personne est déjà le PMO du projet." };
  }

  const { error } = await supabase
    .from("project_members")
    .upsert(
      { project_id: projectId, user_id: prof.id, role },
      { onConflict: "project_id,user_id" },
    );
  if (error) {
    return { ok: false, message: "Invitation refusée (droits insuffisants)." };
  }

  await supabase
    .from("projects")
    .update({ status: "shared" })
    .eq("id", projectId);

  revalidatePath(`/p/${projectId}`, "layout");
  return { ok: true, message: "Invitation enregistrée." };
}

export async function changeMemberRole(
  projectId: string,
  userId: string,
  role: InviteRole,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .update({ role })
    .eq("project_id", projectId)
    .eq("user_id", userId);
  if (error) throw error;
  revalidatePath(`/p/${projectId}`, "layout");
}

export async function removeMember(projectId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);
  if (error) throw error;
  revalidatePath(`/p/${projectId}`, "layout");
}
