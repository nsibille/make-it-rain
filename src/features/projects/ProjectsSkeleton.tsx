import { Skeleton } from "@/components/ui/Skeleton";

/** Squelette du tableau de bord (grille de projets) — route loading.tsx. */
export function ProjectsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-pop border border-border bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Skeleton variant="circle" w={22} h={22} />
              <Skeleton variant="text" w={120} />
            </div>
            <Skeleton w={64} h={18} className="rounded-full" />
          </div>
          <Skeleton variant="text" w={90} className="mt-4" />
          <div className="mt-4 flex items-center gap-2 border-t border-border-soft pt-3">
            <Skeleton w={72} h={28} />
            <Skeleton w={64} h={28} />
            <Skeleton w={26} h={26} className="ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
