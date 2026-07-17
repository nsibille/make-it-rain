import { notFound } from "next/navigation";
import { getProjectAccess } from "@/features/projects/access";
import { getBreakdownNodes } from "@/features/breakdown/data";
import { BreakdownTree } from "@/features/breakdown/BreakdownTree";

export default async function ObsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  if (!access) notFound();

  const nodes = await getBreakdownNodes(projectId, "obs");
  return (
    <BreakdownTree
      projectId={projectId}
      structure="obs"
      canEdit={access.canEdit}
      projectName={access.project.name}
      initialNodes={nodes}
    />
  );
}
