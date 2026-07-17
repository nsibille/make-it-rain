import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/types";

export type ProjectRole = Enums<"project_role"> | null;

export interface ProjectAccess {
  project: Tables<"projects">;
  role: ProjectRole;
  canEdit: boolean; // pmo
  canAnnotate: boolean; // pmo | annotator
}

/**
 * Charge un projet (RLS) et calcule le rôle de l'utilisateur courant.
 * Owner = pmo implicite ; sinon on lit project_members. Renvoie null si le
 * projet n'est pas lisible (RLS). Redirige vers /login sans session.
 */
export async function getProjectAccess(
  projectId: string,
): Promise<ProjectAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (!project) return null;

  let role: ProjectRole = null;
  if (project.owner_id === user.id) {
    role = "pmo";
  } else {
    const { data: member } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    role = member?.role ?? null;
  }

  return {
    project,
    role,
    canEdit: role === "pmo",
    canAnnotate: role === "pmo" || role === "annotator",
  };
}
