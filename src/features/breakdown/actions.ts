"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type { BreakdownNode, Structure } from "./data";

/**
 * Mutations d'arbres. Sécurité par RLS (écriture = pmo). Les codes ne sont
 * jamais écrits : seuls name / parent_id / position / meta le sont.
 */

export async function addNode(
  projectId: string,
  structure: Structure,
  parentId: string,
  meta: Json = {},
): Promise<BreakdownNode> {
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("breakdown_nodes")
    .select("position")
    .eq("project_id", projectId)
    .eq("structure", structure)
    .eq("parent_id", parentId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("breakdown_nodes")
    .insert({
      project_id: projectId,
      structure,
      parent_id: parentId,
      name: "",
      position,
      meta,
    })
    .select()
    .single();
  if (error) throw error;

  revalidatePath(`/p/${projectId}/${structure}`);
  return data;
}

export async function updateNodeName(
  projectId: string,
  structure: Structure,
  id: string,
  name: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("breakdown_nodes")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/p/${projectId}/${structure}`);
}

export async function updateNodeMeta(
  projectId: string,
  structure: Structure,
  id: string,
  meta: Json,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("breakdown_nodes")
    .update({ meta })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/p/${projectId}/${structure}`);
}

export async function deleteNode(
  projectId: string,
  structure: Structure,
  id: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("breakdown_nodes")
    .delete()
    .eq("id", id); // cascade sur les enfants
  if (error) throw error;
  revalidatePath(`/p/${projectId}/${structure}`);
}
