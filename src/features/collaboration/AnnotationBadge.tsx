"use client";

import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAnnotations } from "./AnnotationsProvider";

/** Badge compteur d'annotations sur un nœud ; ouvre le volet au clic. */
export function AnnotationBadge({
  nodeId,
  isRoot = false,
}: {
  nodeId: string;
  isRoot?: boolean;
}) {
  const { counts, open, canAnnotate } = useAnnotations();
  const count = counts[nodeId] ?? 0;

  // Rien à montrer si aucun commentaire et pas le droit d'en ajouter.
  if (count === 0 && !canAnnotate) return null;

  return (
    <button
      onClick={() => open(nodeId)}
      aria-label={`Annotations (${count})`}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-chip px-1 py-0.5 font-mono text-nano",
        count > 0
          ? isRoot
            ? "bg-surface/20 text-surface"
            : "bg-obs-soft text-obs-text"
          : isRoot
            ? "text-surface/60 hover:bg-surface/10"
            : "text-ink-4 hover:bg-surface-2",
      )}
    >
      <MessageSquare size={11} aria-hidden />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
