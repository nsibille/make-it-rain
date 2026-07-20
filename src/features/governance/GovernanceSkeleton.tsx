import { Skeleton } from "@/components/ui/Skeleton";

function InstanceCardSkeleton() {
  return (
    <div className="rounded-pop border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton variant="text" w={200} className="h-4" />
        <Skeleton w={26} h={26} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton variant="text" w={70} />
            <Skeleton h={30} className="mt-1.5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Squelette de la gouvernance (instances + matrice RACI) — route loading.tsx. */
export function GovernanceSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 pt-14 sm:px-10 lg:pt-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Skeleton variant="text" w={140} className="h-5" />
          <Skeleton variant="text" w={280} className="mt-2" />
        </div>
        <Skeleton w={92} h={28} />
      </header>

      <div className="space-y-4">
        <InstanceCardSkeleton />
        <InstanceCardSkeleton />
      </div>

      <div className="mt-8">
        <Skeleton variant="text" w={120} className="h-4" />
        <Skeleton h={160} className="mt-3 w-full" />
      </div>
    </div>
  );
}
