"use client";

import { BreakdownTree } from "@/features/breakdown/BreakdownTree";
import type { BreakdownNode, Structure } from "@/features/breakdown/data";
import { AnnotationsProvider } from "./AnnotationsProvider";
import { AnnotationDrawer } from "./AnnotationDrawer";
import type { AnnotationCounts } from "./types";

/** Écran d'arbre = arbre + annotations temps réel (provider + volet). */
export function BreakdownScreen({
  projectId,
  structure,
  canEdit,
  canAnnotate,
  projectName,
  initialNodes,
  initialCounts,
}: {
  projectId: string;
  structure: Structure;
  canEdit: boolean;
  canAnnotate: boolean;
  projectName: string;
  initialNodes: BreakdownNode[];
  initialCounts: AnnotationCounts;
}) {
  return (
    <AnnotationsProvider
      projectId={projectId}
      canAnnotate={canAnnotate}
      initialCounts={initialCounts}
    >
      <BreakdownTree
        projectId={projectId}
        structure={structure}
        canEdit={canEdit}
        projectName={projectName}
        initialNodes={initialNodes}
      />
      <AnnotationDrawer />
    </AnnotationsProvider>
  );
}
