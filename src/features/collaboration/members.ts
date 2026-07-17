import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/types";

export interface Member {
  user_id: string;
  role: Enums<"project_role">;
  email: string;
}

/** Membres invités d'un projet (RLS : lisible si accès au projet). */
export async function getProjectMembers(projectId: string): Promise<Member[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_members")
    .select("user_id, role, profiles(email)")
    .eq("project_id", projectId);

  return (data ?? []).map((m) => {
    const prof = m.profiles as unknown as { email: string | null } | null;
    return {
      user_id: m.user_id,
      role: m.role,
      email: prof?.email ?? "",
    };
  });
}
