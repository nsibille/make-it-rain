import { Skeleton } from "@/components/ui/Skeleton";
import { ProjectsSkeleton } from "@/features/projects/ProjectsSkeleton";

/** Écran de chargement du tableau de bord (skeleton + lazy loading). */
export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 pt-14 sm:px-10 lg:pt-10">
      <header className="mb-6">
        <Skeleton variant="text" w={120} />
        <Skeleton variant="text" w={160} className="mt-2 h-5" />
        <Skeleton variant="text" w={320} className="mt-2" />
      </header>
      <ProjectsSkeleton />
    </main>
  );
}
