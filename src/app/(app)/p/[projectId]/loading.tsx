import { ProjectShellSkeleton } from "@/features/projects/ProjectShellSkeleton";
import { SixPackSkeleton } from "@/features/six-pack/SixPackSkeleton";

/** Coquille de chargement d'un projet (en-tête + onglets + première vue). */
export default function ProjectLoading() {
  return (
    <ProjectShellSkeleton>
      <SixPackSkeleton />
    </ProjectShellSkeleton>
  );
}
