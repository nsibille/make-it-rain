import { notFound } from "next/navigation";
import { getProjectAccess } from "@/features/projects/access";
import { getGovernance } from "@/features/governance/data";
import { Governance } from "@/features/governance/Governance";

export default async function GovernancePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  if (!access) notFound();

  const data = await getGovernance(projectId);
  return (
    <Governance
      projectId={projectId}
      canEdit={access.canEdit}
      initial={data}
    />
  );
}
