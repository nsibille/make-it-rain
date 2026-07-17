"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/features/projects/status";

/**
 * Server Actions du domaine filesystem / projets.
 * La sécurité vit dans la RLS (owner = auth.uid(), écriture = pmo) ;
 * ces actions posent juste owner_id/org_id et laissent la base trancher.
 */

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  return { supabase, user, orgId: profile?.org_id ?? null };
}

export async function createFolder(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const parentId = (formData.get("parentId") as string) || null;
  if (!name) return;

  const { supabase, user, orgId } = await requireUser();
  const { error } = await supabase.from("folders").insert({
    name,
    parent_id: parentId,
    owner_id: user.id,
    org_id: orgId,
  });
  if (error) throw error;
  revalidatePath("/");
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const folderId = (formData.get("folderId") as string) || null;
  const emoji = String(formData.get("emoji") ?? "").trim() || "📁";
  if (!name) return;

  const { supabase, user, orgId } = await requireUser();
  // Le trigger bootstrap_project crée 6-Pack + gouvernance + 3 racines.
  const { error } = await supabase.from("projects").insert({
    name,
    folder_id: folderId,
    emoji,
    owner_id: user.id,
    org_id: orgId,
  });
  if (error) throw error;
  revalidatePath("/");
}

export async function setProjectStatus(formData: FormData) {
  const id = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "") as ProjectStatus;
  if (!id || !["draft", "published", "shared"].includes(status)) return;

  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id); // RLS : update réservé au pmo
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteProject(formData: FormData) {
  const id = String(formData.get("projectId") ?? "");
  if (!id) return;

  const { supabase } = await requireUser();
  const { error } = await supabase.from("projects").delete().eq("id", id); // RLS : owner only
  if (error) throw error;
  revalidatePath("/");
}

export async function deleteFolder(formData: FormData) {
  const id = String(formData.get("folderId") ?? "");
  if (!id) return;

  const { supabase } = await requireUser();
  const { error } = await supabase.from("folders").delete().eq("id", id); // RLS : owner only
  if (error) throw error;
  revalidatePath("/");
}
