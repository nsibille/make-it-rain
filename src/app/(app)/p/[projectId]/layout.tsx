import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProjectAccess, type ProjectRole } from "@/features/projects/access";
import { ProjectTabs } from "@/features/projects/ProjectTabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PROJECT_STATUS } from "@/features/projects/status";
import { getProjectMembers } from "@/features/collaboration/members";
import { ShareButton } from "@/features/collaboration/ShareButton";

const ROLE_LABEL: Record<NonNullable<ProjectRole>, string> = {
  pmo: "PMO",
  annotator: "Annotateur",
  observer: "Observateur",
};

/**
 * Layout d'un projet : charge le projet + rôle (RLS), affiche l'en-tête
 * et les onglets de vue. Les pages enfants rechargent leurs données en RSC.
 */
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await getProjectAccess(projectId);
  if (!access) notFound();

  const { project, role } = access;
  const status = PROJECT_STATUS[project.status];
  const members = access.canEdit ? await getProjectMembers(projectId) : [];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border-soft px-4 pt-14 pb-3 sm:px-6 lg:pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-caption text-ink-3 hover:text-ink"
        >
          <ArrowLeft size={13} aria-hidden />
          Tous les projets
        </Link>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span aria-hidden className="text-title leading-none">
              {project.emoji ?? "📁"}
            </span>
            <h1 className="text-title text-ink">{project.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="label-mono text-nano !text-ink-3">
              {role ? ROLE_LABEL[role] : "Lecture seule"}
            </span>
            <StatusBadge label={status.label} dotClassName={status.dot} />
            {access.canEdit && (
              <ShareButton projectId={projectId} members={members} />
            )}
          </div>
        </div>
      </header>

      <ProjectTabs projectId={projectId} />

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
