import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/types";

export type BreakdownNode = Tables<"breakdown_nodes">;
export type Structure = Enums<"structure_kind">;

/** Tous les nœuds d'une arborescence (RLS), triés par position. */
export async function getBreakdownNodes(
  projectId: string,
  structure: Structure,
): Promise<BreakdownNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("breakdown_nodes")
    .select("*")
    .eq("project_id", projectId)
    .eq("structure", structure)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
