import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

function BlockSkeleton({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <section className={`rounded-pop border border-border bg-surface p-4 ${className ?? ""}`}>
      <Skeleton variant="text" w={140} />
      <Skeleton variant="text" w={90} className="mt-2 opacity-70" />
      <div className="mt-4 flex flex-col gap-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant="circle" w={6} h={6} />
            <Skeleton variant="text" className="w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Squelette du 6-Pack (prose + blocs de listes) — route loading.tsx. */
export function SixPackSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 pt-14 sm:px-10 lg:pt-8">
      <header className="mb-6">
        <Skeleton variant="text" w={120} className="h-5" />
        <SkeletonText lines={2} className="mt-2 max-w-lg" />
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <BlockSkeleton className="lg:col-span-2" rows={2} />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton className="lg:col-span-2" rows={2} />
      </div>
    </div>
  );
}
