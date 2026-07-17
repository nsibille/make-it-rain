"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type { Instance, Raci } from "./data";

/** Écritures gouvernance (jsonb). Sécurité RLS : écriture = pmo. */

export async function saveInstances(projectId: string, instances: Instance[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("governance")
    .update({ instances: instances as unknown as Json })
    .eq("project_id", projectId);
  if (error) throw error;
  revalidatePath(`/p/${projectId}/governance`);
}

export async function saveRaci(projectId: string, raci: Raci) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("governance")
    .update({ raci: raci as unknown as Json })
    .eq("project_id", projectId);
  if (error) throw error;
  revalidatePath(`/p/${projectId}/governance`);
}
