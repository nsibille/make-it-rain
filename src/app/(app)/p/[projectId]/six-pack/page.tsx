import { notFound } from "next/navigation";
import { getProjectAccess } from "@/features/projects/access";
import { getSixpack } from "@/features/six-pack/data";
import { SixPack } from "@/features/six-pack/SixPack";

export default async function SixPackPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  if (!access) notFound();

  const data = await getSixpack(projectId);

  return (
    <SixPack projectId={projectId} canEdit={access.canEdit} initial={data} />
  );
}
