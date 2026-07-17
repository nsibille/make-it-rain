import type { Enums } from "@/lib/supabase/types";

export type ProjectStatus = Enums<"project_status">;

/**
 * Cycle de vie projet (PROJECT_SPEC §4) : Brouillon → Publié → Partagé.
 * Draft = neutre (--ink-4) ; Publié = ok (--status-done) ;
 * Partagé = actif (--status-progress). Teintes issues des tokens.
 */
export const PROJECT_STATUS: Record<
  ProjectStatus,
  { label: string; dot: string }
> = {
  draft: { label: "Brouillon", dot: "bg-ink-4" },
  published: { label: "Publié", dot: "bg-status-done" },
  shared: { label: "Partagé", dot: "bg-status-progress" },
};
