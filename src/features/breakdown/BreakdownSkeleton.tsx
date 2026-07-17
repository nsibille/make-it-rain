import { Skeleton } from "@/components/ui/Skeleton";

/** Une carte de nœud fantôme, positionnée en absolu dans le canvas. */
function NodeSkeleton({
  x,
  y,
  root = false,
}: {
  x: number;
  y: number;
  root?: boolean;
}) {
  return (
    <div
      className="absolute rounded-node border border-border bg-surface p-3 shadow-1"
      style={{ left: x, top: y, width: 212 }}
    >
      <Skeleton variant="text" w={root ? 60 : 80} className="opacity-70" />
      <Skeleton variant="text" className="mt-2 w-3/4 h-3" />
    </div>
  );
}

/**
 * Squelette d'un arbre (PBS / WBS / OBS) : barre d'outils + canvas avec
 * quelques nœuds fantômes reliés — route loading.tsx des vues d'arbre.
 */
export function BreakdownSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col">
      <div className="flex items-center gap-3 px-4 py-2 sm:px-6">
        <Skeleton variant="text" w={180} />
        <div className="ml-auto flex items-center gap-1">
          <Skeleton w={28} h={28} />
          <Skeleton w={40} h={16} />
          <Skeleton w={28} h={28} />
          <Skeleton w={28} h={28} />
        </div>
      </div>

      <div className="relative mx-4 mb-4 flex-1 overflow-hidden rounded-pop border border-border bg-surface-2 sm:mx-6">
        <NodeSkeleton x={220} y={40} root />
        <NodeSkeleton x={70} y={190} />
        <NodeSkeleton x={330} y={190} />
        <NodeSkeleton x={590} y={190} />
        <NodeSkeleton x={70} y={330} />
        <NodeSkeleton x={330} y={330} />
      </div>
    </div>
  );
}
