import { Skeleton } from "@/components/ui/Skeleton";
import { PROJECT_VIEWS } from "./views";

/**
 * Squelette de l'en-tête + onglets d'un projet — sert de coquille pendant
 * le chargement d'une vue (route loading.tsx du segment projet).
 */
export function ProjectShellSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border-soft px-4 pt-14 pb-3 sm:px-6 lg:pt-4">
        <Skeleton variant="text" w={110} />
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="circle" w={22} h={22} />
            <Skeleton variant="text" w={180} className="h-4" />
            <Skeleton w={70} h={20} className="rounded-full" />
          </div>
          <Skeleton w={92} h={28} />
        </div>
      </header>

      <nav className="flex gap-1 border-b border-border px-4 sm:px-6">
        {PROJECT_VIEWS.map((v) => (
          <div key={v.slug} className="px-3 py-2">
            <Skeleton variant="text" w={48} />
          </div>
        ))}
      </nav>

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
