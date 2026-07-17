import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type SixpackItem = Tables<"sixpack_items">;

export interface SixpackData {
  contexte: string;
  contraintes: string;
  items: SixpackItem[];
}

/** Charge le 6-Pack d'un projet (prose + items), soumis à la RLS. */
export async function getSixpack(projectId: string): Promise<SixpackData> {
  const supabase = await createClient();
  const [{ data: sp }, { data: items }] = await Promise.all([
    supabase
      .from("sixpacks")
      .select("contexte, contraintes")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase
      .from("sixpack_items")
      .select("*")
      .eq("project_id", projectId)
      .order("position", { ascending: true }),
  ]);

  return {
    contexte: sp?.contexte ?? "",
    contraintes: sp?.contraintes ?? "",
    items: items ?? [],
  };
}
