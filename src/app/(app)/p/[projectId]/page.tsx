import { redirect } from "next/navigation";

/** Point d'entrée projet → première vue (6-Pack). */
export default async function ProjectIndex({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/p/${projectId}/six-pack`);
}
