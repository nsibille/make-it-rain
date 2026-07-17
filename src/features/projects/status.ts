import type { Enums } from "@/lib/supabase/types";
import type { StatusTone } from "@/components/ui/StatusBadge";

export type ProjectStatus = Enums<"project_status">;

/**
 * Cycle de vie projet (PROJECT_SPEC §4) : Brouillon → Publié → Partagé.
 * Draft = neutre ; Publié = terminé (vert) ; Partagé = en cours (bleu).
 * Teintes portées par le token d'état via le badge.
 */
export const PROJECT_STATUS: Record<
  ProjectStatus,
  { label: string; tone: StatusTone; dot: string }
> = {
  draft: { label: "Brouillon", tone: "draft", dot: "bg-status-draft" },
  published: { label: "Publié", tone: "done", dot: "bg-status-done" },
  shared: { label: "Partagé", tone: "progress", dot: "bg-status-progress" },
};
