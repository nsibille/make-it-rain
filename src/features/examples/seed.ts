import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type { Structure } from "@/features/breakdown/data";
import type { Instance } from "@/features/governance/data";
import {
  EXAMPLE_PROJECTS,
  type ExampleProject,
  type GovInstance,
  type TreeNode,
} from "@/data/examples";

/**
 * Le schéma d'exemple porte `objectifs: string[]` (plusieurs objectifs par
 * réunion) alors que le modèle gouvernance de l'app n'a qu'un `objectif`
 * unique (une zone de texte). On fait le pont en joignant les objectifs, sans
 * migration ni refonte de la gouvernance.
 */
function toInstance(gi: GovInstance): Instance {
  const { objectifs, ...rest } = gi;
  return { ...rest, objectif: objectifs.join("\n") };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Clone les deux exemples pizza dans un dossier système « Exemples » à la
 * première connexion. Idempotent : ne fait rien si le dossier existe déjà.
 * Tout passe par la RLS (l'utilisateur est owner = pmo de ses exemples).
 */
export async function seedExamplesIfEmpty(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("folders")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_system", true)
    .limit(1)
    .maybeSingle();
  if (existing) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  const orgId = profile?.org_id ?? null;

  const { data: folder } = await supabase
    .from("folders")
    .insert({
      owner_id: user.id,
      org_id: orgId,
      name: "Exemples",
      is_system: true,
    })
    .select("id")
    .single();
  if (!folder) return;

  for (const ex of EXAMPLE_PROJECTS) {
    await seedProject(supabase, user.id, orgId, folder.id, ex);
  }
}

async function seedProject(
  supabase: Supabase,
  userId: string,
  orgId: string | null,
  folderId: string,
  ex: ExampleProject,
): Promise<void> {
  const { data: project } = await supabase
    .from("projects")
    .insert({
      owner_id: userId,
      org_id: orgId,
      folder_id: folderId,
      name: ex.name,
      emoji: ex.emoji,
      status: ex.status,
    })
    .select("id")
    .single();
  if (!project) return;
  const pid = project.id;

  // Le trigger bootstrap_project a créé 6-Pack, gouvernance et 3 racines.
  const { data: roots } = await supabase
    .from("breakdown_nodes")
    .select("id, structure")
    .eq("project_id", pid)
    .is("parent_id", null);
  const rootBy = new Map((roots ?? []).map((r) => [r.structure, r.id]));

  // 6-Pack : prose
  await supabase
    .from("sixpacks")
    .update({
      contexte: ex.sixpack.contexte,
      contraintes: ex.sixpack.contraintes,
    })
    .eq("project_id", pid);

  // 6-Pack : items
  const items: {
    project_id: string;
    kind: "objective" | "deliverable" | "scope_in" | "scope_out" | "stakeholder" | "milestone";
    label: string;
    position: number;
    meta: Json;
  }[] = [];
  ex.sixpack.objectifs.forEach((label, i) =>
    items.push({ project_id: pid, kind: "objective", label, position: i, meta: {} }),
  );
  ex.sixpack.livrables.forEach((label, i) =>
    items.push({ project_id: pid, kind: "deliverable", label, position: i, meta: {} }),
  );
  ex.sixpack.perimetre.in.forEach((label, i) =>
    items.push({ project_id: pid, kind: "scope_in", label, position: i, meta: {} }),
  );
  ex.sixpack.perimetre.out.forEach((label, i) =>
    items.push({ project_id: pid, kind: "scope_out", label, position: i, meta: {} }),
  );
  ex.sixpack.parties_prenantes.forEach((s, i) =>
    items.push({
      project_id: pid,
      kind: "stakeholder",
      label: s.name,
      position: i,
      meta: { role: s.role },
    }),
  );
  ex.sixpack.jalons.forEach((m, i) =>
    items.push({
      project_id: pid,
      kind: "milestone",
      label: m.label,
      position: i,
      meta: { date: m.date },
    }),
  );
  if (items.length) await supabase.from("sixpack_items").insert(items);

  // Arbres : renomme la racine puis insère les enfants
  const trees: [Structure, TreeNode][] = [
    ["pbs", ex.pbs],
    ["wbs", ex.wbs],
    ["obs", ex.obs],
  ];
  for (const [structure, tree] of trees) {
    const rootId = rootBy.get(structure);
    if (!rootId) continue;
    await supabase
      .from("breakdown_nodes")
      .update({ name: tree.name, meta: (tree.meta ?? {}) as Json })
      .eq("id", rootId);
    await insertChildren(supabase, pid, structure, rootId, tree.children ?? []);
  }

  // Gouvernance
  await supabase
    .from("governance")
    .update({
      instances: ex.governance.instances.map(toInstance) as unknown as Json,
      raci: ex.governance.raci as unknown as Json,
    })
    .eq("project_id", pid);
}

async function insertChildren(
  supabase: Supabase,
  projectId: string,
  structure: Structure,
  parentId: string,
  nodes: TreeNode[],
): Promise<void> {
  if (nodes.length === 0) return;

  const rows = nodes.map((n, i) => ({
    project_id: projectId,
    structure,
    parent_id: parentId,
    name: n.name,
    position: i,
    meta: (n.meta ?? {}) as Json,
  }));

  const { data: inserted } = await supabase
    .from("breakdown_nodes")
    .insert(rows)
    .select("id");
  if (!inserted) return;

  // PostgREST conserve l'ordre d'insertion → alignement avec `nodes`.
  for (let i = 0; i < nodes.length; i++) {
    const kids = nodes[i].children;
    if (kids && kids.length) {
      await insertChildren(supabase, projectId, structure, inserted[i].id, kids);
    }
  }
}
