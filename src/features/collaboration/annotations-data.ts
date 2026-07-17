import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AnnotationCounts } from "./types";

/** Nombre d'annotations par nœud pour un projet (RLS : accès projet). */
export async function getAnnotationCounts(
  projectId: string,
): Promise<AnnotationCounts> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("annotations")
    .select("node_id")
    .eq("project_id", projectId);

  const counts: AnnotationCounts = {};
  for (const a of data ?? []) {
    counts[a.node_id] = (counts[a.node_id] ?? 0) + 1;
  }
  return counts;
}
