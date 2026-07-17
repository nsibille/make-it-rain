import { notFound } from "next/navigation";
import { getProjectAccess } from "@/features/projects/access";
import { getBreakdownNodes } from "@/features/breakdown/data";
import { getAnnotationCounts } from "@/features/collaboration/annotations-data";
import { BreakdownScreen } from "@/features/collaboration/BreakdownScreen";

export default async function ObsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  if (!access) notFound();

  const [nodes, counts] = await Promise.all([
    getBreakdownNodes(projectId, "obs"),
    getAnnotationCounts(projectId),
  ]);

  return (
    <BreakdownScreen
      projectId={projectId}
      structure="obs"
      canEdit={access.canEdit}
      canAnnotate={access.canAnnotate}
      projectName={access.project.name}
      initialNodes={nodes}
      initialCounts={counts}
    />
  );
}
