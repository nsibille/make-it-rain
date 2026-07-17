"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Json, Tables } from "@/lib/supabase/types";

type SixpackKind = Enums<"sixpack_kind">;
type ProseField = "contexte" | "contraintes";

/**
 * Mutations 6-Pack. La sécurité vit dans la RLS (écriture = pmo) ;
 * ces actions écrivent et laissent la base autoriser/refuser.
 */

export async function updateSixpackProse(
  projectId: string,
  field: ProseField,
  value: string,
) {
  const supabase = await createClient();
  const patch =
    field === "contexte" ? { contexte: value } : { contraintes: value };
  const { error } = await supabase
    .from("sixpacks")
    .update(patch)
    .eq("project_id", projectId);
  if (error) throw error;
  revalidatePath(`/p/${projectId}/six-pack`);
}

export async function addSixpackItem(
  projectId: string,
  kind: SixpackKind,
  label: string,
  meta: Json = {},
): Promise<Tables<"sixpack_items">> {
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("sixpack_items")
    .select("position")
    .eq("project_id", projectId)
    .eq("kind", kind)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("sixpack_items")
    .insert({ project_id: projectId, kind, label, meta, position })
    .select()
    .single();
  if (error) throw error;

  revalidatePath(`/p/${projectId}/six-pack`);
  return data;
}

export async function updateSixpackItem(
  projectId: string,
  id: string,
  label: string,
  meta: Json = {},
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sixpack_items")
    .update({ label, meta })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/p/${projectId}/six-pack`);
}

export async function deleteSixpackItem(projectId: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sixpack_items").delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/p/${projectId}/six-pack`);
}
