"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { hierarchy, tree, type HierarchyPointNode } from "d3-hierarchy";
import { Maximize2, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";
import type { Json } from "@/lib/supabase/types";
import type { BreakdownNode, Structure } from "./data";
import { nodeCode, projectCode } from "./codes";
import {
  addNode,
  deleteNode,
  updateNodeMeta,
  updateNodeName,
} from "./actions";
import { AnnotationBadge } from "@/features/collaboration/AnnotationBadge";

const NODE_W = 212;
const GAP_X = 40;
const LEVEL_H = 152;
const CARD_H = 62;
const PAD = 60;

const HUE: Record<Structure, { rail: string; text: string }> = {
  pbs: { rail: "border-l-pbs", text: "text-pbs" },
  wbs: { rail: "border-l-wbs", text: "text-wbs" },
  obs: { rail: "border-l-obs", text: "text-obs" },
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

function metaString(meta: Json | null, key: string): string {
  const m = meta as Record<string, unknown> | null;
  const v = m?.[key];
  return typeof v === "string" ? v : "";
}

export function BreakdownTree({
  projectId,
  structure,
  canEdit,
  projectName,
  initialNodes,
}: {
  projectId: string;
  structure: Structure;
  canEdit: boolean;
  projectName: string;
  initialNodes: BreakdownNode[];
}) {
  const [nodes, setNodes] = useState<BreakdownNode[]>(initialNodes);
  const numbered = structure !== "obs";
  const hue = HUE[structure];

  // ── Mutations optimistes ────────────────────────────────
  const [, startTransition] = useTransition();

  // Ajout optimiste : le nœud apparaît immédiatement (id `temp-`), sans
  // attendre l'API. À la réconciliation, on remplace l'id temporaire par l'id
  // réel et on reporte ce changement sur d'éventuels enfants déjà rattachés.
  const addChild = useCallback(
    (parentId: string) => {
      const id = `temp-${crypto.randomUUID()}`;
      setNodes((prev) => {
        const siblings = prev.filter((n) => n.parent_id === parentId);
        return [
          ...prev,
          {
            id,
            project_id: projectId,
            structure,
            parent_id: parentId,
            name: "",
            position: siblings.length,
            meta: {},
            created_at: null,
          },
        ];
      });
      (async () => {
        try {
          const row = await addNode(projectId, structure, parentId);
          setNodes((prev) =>
            prev.map((n) =>
              n.id === id
                ? // Conserve une saisie faite pendant la fenêtre optimiste.
                  { ...row, name: n.name || row.name, meta: n.meta ?? row.meta }
                : n.parent_id === id
                  ? { ...n, parent_id: row.id }
                  : n,
            ),
          );
        } catch {
          // Retire le sous-arbre optimiste en cas d'échec réel.
          setNodes((prev) => prev.filter((n) => n.id !== id && n.parent_id !== id));
        }
      })();
    },
    [projectId, structure],
  );

  const commitName = useCallback(
    (id: string, name: string) => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, name } : n)));
      startTransition(() => updateNodeName(projectId, structure, id, name));
    },
    [projectId, structure],
  );

  const commitMeta = useCallback(
    (id: string, meta: Json) => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, meta } : n)));
      startTransition(() => updateNodeMeta(projectId, structure, id, meta));
    },
    [projectId, structure],
  );

  const remove = useCallback(
    (id: string) => {
      // retire le sous-arbre localement
      setNodes((prev) => {
        const childrenOf = new Map<string | null, BreakdownNode[]>();
        for (const n of prev) {
          const arr = childrenOf.get(n.parent_id) ?? [];
          arr.push(n);
          childrenOf.set(n.parent_id, arr);
        }
        const doomed = new Set<string>();
        const stack = [id];
        while (stack.length) {
          const cur = stack.pop()!;
          doomed.add(cur);
          for (const c of childrenOf.get(cur) ?? []) stack.push(c.id);
        }
        return prev.filter((n) => !doomed.has(n.id));
      });
      startTransition(() => deleteNode(projectId, structure, id));
    },
    [projectId, structure],
  );

  // ── Layout d3-hierarchy ─────────────────────────────────
  const layout = useMemo(() => {
    const childrenBy = new Map<string | null, BreakdownNode[]>();
    for (const n of nodes) {
      const arr = childrenBy.get(n.parent_id) ?? [];
      arr.push(n);
      childrenBy.set(n.parent_id, arr);
    }
    for (const arr of childrenBy.values())
      arr.sort((a, b) => a.position - b.position);

    const rootNode = childrenBy.get(null)?.[0];
    if (!rootNode) return null;

    // profondeurs (arbre complet)
    const depthBy = new Map<string, number>();
    const queue: Array<{ id: string; d: number }> = [
      { id: rootNode.id, d: 0 },
    ];
    while (queue.length) {
      const { id, d } = queue.shift()!;
      depthBy.set(id, d);
      for (const c of childrenBy.get(id) ?? []) queue.push({ id: c.id, d: d + 1 });
    }

    // enfants pris en compte par le layout (les N5 = notes sont exclus)
    const layoutChildren = (n: BreakdownNode): BreakdownNode[] => {
      const kids = childrenBy.get(n.id) ?? [];
      if (numbered && (depthBy.get(n.id) ?? 0) >= 3) return [];
      return kids;
    };

    const h = tree<BreakdownNode>()
      .nodeSize([NODE_W + GAP_X, LEVEL_H])(
      hierarchy<BreakdownNode>(rootNode, layoutChildren),
    );

    const descendants = h.descendants();
    const minX = Math.min(...descendants.map((d) => d.x));
    const shiftX = -minX + PAD + NODE_W / 2;

    const posBy = new Map<string, { x: number; y: number }>();
    for (const d of descendants)
      posBy.set(d.data.id, { x: d.x + shiftX, y: d.y + PAD });

    // codes (numérotés uniquement)
    const codeBy = new Map<string, string>();
    if (numbered) {
      const rootCode = projectCode(projectName);
      h.each((d: HierarchyPointNode<BreakdownNode>) => {
        if (d.depth === 0) {
          codeBy.set(d.data.id, rootCode);
        } else {
          const idx = d.parent!.children!.indexOf(d);
          const parentCode = codeBy.get(d.parent!.data.id) ?? rootCode;
          codeBy.set(d.data.id, nodeCode(d.depth, idx, parentCode, rootCode));
        }
      });
    }

    // notes N5 : enfants d'un N4 (depth 3) pour les structures numérotées
    const notesBy = new Map<string, BreakdownNode[]>();
    if (numbered) {
      for (const d of descendants) {
        if ((depthBy.get(d.data.id) ?? 0) === 3)
          notesBy.set(d.data.id, childrenBy.get(d.data.id) ?? []);
      }
    }

    const width =
      Math.max(...descendants.map((d) => d.x + shiftX)) + NODE_W / 2 + PAD;
    const height = Math.max(...descendants.map((d) => d.y)) + PAD + 260;

    const links = h.links().map((l) => ({
      source: posBy.get(l.source.data.id)!,
      target: posBy.get(l.target.data.id)!,
    }));

    return {
      descendants,
      posBy,
      codeBy,
      notesBy,
      depthBy,
      links,
      width,
      height,
    };
  }, [nodes, numbered, projectName]);

  // ── Pan & zoom ──────────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [panning, setPanning] = useState(false);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const drag = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);
  const touch = useRef<{
    mode: "pan" | "pinch";
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    d0: number;
    k0: number;
    mx: number;
    my: number;
  } | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setView((v) => {
        const k = clamp(v.k * (1 - e.deltaY * 0.0015), 0.4, 2);
        const x = mx - ((mx - v.x) / v.k) * k;
        const y = my - ((my - v.y) / v.k) * k;
        return { x, y, k };
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest("[data-card]")) return;
      const rect = el.getBoundingClientRect();
      const v = viewRef.current;
      if (e.touches.length === 1) {
        touch.current = {
          mode: "pan",
          sx: e.touches[0].clientX,
          sy: e.touches[0].clientY,
          ox: v.x,
          oy: v.y,
          d0: 0,
          k0: v.k,
          mx: 0,
          my: 0,
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touch.current = {
          mode: "pinch",
          sx: 0,
          sy: 0,
          ox: v.x,
          oy: v.y,
          d0: Math.hypot(dx, dy) || 1,
          k0: v.k,
          mx: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
          my: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const cur = touch.current;
      if (!cur) return;
      e.preventDefault();
      if (cur.mode === "pan" && e.touches.length >= 1) {
        setView((v) => ({
          ...v,
          x: cur.ox + (e.touches[0].clientX - cur.sx),
          y: cur.oy + (e.touches[0].clientY - cur.sy),
        }));
      } else if (cur.mode === "pinch" && e.touches.length >= 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const k = clamp((cur.k0 * Math.hypot(dx, dy)) / cur.d0, 0.4, 2);
        setView({
          k,
          x: cur.mx - ((cur.mx - cur.ox) / cur.k0) * k,
          y: cur.my - ((cur.my - cur.oy) / cur.k0) * k,
        });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) touch.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  function onPointerDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-card]")) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
    setPanning(true);
  }
  function onPointerMove(e: React.MouseEvent) {
    if (!drag.current) return;
    setView((v) => ({
      ...v,
      x: drag.current!.ox + (e.clientX - drag.current!.sx),
      y: drag.current!.oy + (e.clientY - drag.current!.sy),
    }));
  }
  function endDrag() {
    drag.current = null;
    setPanning(false);
  }

  if (!layout) {
    return (
      <div className="px-6 py-10 text-body text-ink-3">
        Arbre introuvable pour ce projet.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col">
      {/* Barre d'outils */}
      <div className="flex items-center gap-3 px-4 py-2 sm:px-6">
        <p className="label-mono text-nano">
          {structure.toUpperCase()} —{" "}
          {numbered ? "boîtes N1→N4 + notes N5" : "acteurs & responsabilités"}
        </p>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() =>
              setView((v) => ({ ...v, k: clamp(v.k - 0.15, 0.4, 2) }))
            }
            aria-label="Dézoomer"
            className="rounded-node border border-border p-1.5 text-ink-2 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 active:scale-90"
          >
            <Minus size={14} aria-hidden />
          </button>
          <span className="w-10 text-center font-mono text-nano text-ink-3">
            {Math.round(view.k * 100)}%
          </span>
          <button
            onClick={() =>
              setView((v) => ({ ...v, k: clamp(v.k + 0.15, 0.4, 2) }))
            }
            aria-label="Zoomer"
            className="rounded-node border border-border p-1.5 text-ink-2 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 active:scale-90"
          >
            <Plus size={14} aria-hidden />
          </button>
          <button
            onClick={() => setView({ x: 0, y: 0, k: 1 })}
            aria-label="Réinitialiser la vue"
            className="ml-1 rounded-node border border-border p-1.5 text-ink-2 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 active:scale-90"
          >
            <Maximize2 size={14} aria-hidden />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        data-slug={SLUGS.breakdownTree}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className={cn(
          "relative mx-4 mb-4 flex-1 overflow-hidden rounded-pop border border-border bg-surface-2 sm:mx-6",
          panning ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {/* Légende de niveaux */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1">
          {(numbered
            ? ["N1", "N2", "N3", "N4", "N5"]
            : ["N1", "N2", "N3", "N4"]
          ).map((lvl) => (
            <span key={lvl} className="font-mono text-nano text-ink-4">
              {lvl}
            </span>
          ))}
        </div>

        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
          }}
        >
          {/* Connecteurs orthogonaux */}
          <svg
            className="absolute left-0 top-0"
            width={layout.width}
            height={layout.height}
            aria-hidden
          >
            {layout.links.map((l, i) => {
              const midY = (l.source.y + CARD_H + l.target.y) / 2;
              return (
                <path
                  key={i}
                  d={`M ${l.source.x} ${l.source.y + CARD_H} V ${midY} H ${l.target.x} V ${l.target.y}`}
                  fill="none"
                  stroke="var(--graph-connector)"
                  strokeWidth={1}
                />
              );
            })}
          </svg>

          {/* Cartes */}
          {layout.descendants.map((d) => {
            const node = d.data;
            const pos = layout.posBy.get(node.id)!;
            const depth = layout.depthBy.get(node.id) ?? 0;
            return (
              <NodeCard
                key={node.id}
                node={node}
                depth={depth}
                structure={structure}
                numbered={numbered}
                hue={hue}
                code={layout.codeBy.get(node.id)}
                notes={layout.notesBy.get(node.id) ?? []}
                canEdit={canEdit}
                x={pos.x}
                y={pos.y}
                onAddChild={addChild}
                onCommitName={commitName}
                onCommitMeta={commitMeta}
                onRemove={remove}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NodeCard({
  node,
  depth,
  structure,
  numbered,
  hue,
  code,
  notes,
  canEdit,
  x,
  y,
  onAddChild,
  onCommitName,
  onCommitMeta,
  onRemove,
}: {
  node: BreakdownNode;
  depth: number;
  structure: Structure;
  numbered: boolean;
  hue: { rail: string; text: string };
  code?: string;
  notes: BreakdownNode[];
  canEdit: boolean;
  x: number;
  y: number;
  onAddChild: (parentId: string) => void;
  onCommitName: (id: string, name: string) => void;
  onCommitMeta: (id: string, meta: Json) => void;
  onRemove: (id: string) => void;
}) {
  const isRoot = depth === 0;
  const isObs = structure === "obs";
  const isNotesLevel = numbered && depth === 3;
  const canAddBox = numbered ? depth < 3 : depth < 4;
  const pending = node.id.startsWith("temp-");

  return (
    <div
      data-card
      className={cn(
        "group animate-fade-in-up absolute rounded-node border shadow-1 transition-[opacity,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease)] hover:shadow-2",
        isRoot
          ? "border-ink bg-ink text-surface"
          : cn("border-border border-l-[3px] bg-surface", hue.rail),
        pending && "opacity-60",
      )}
      style={{ left: x - NODE_W / 2, top: y, width: NODE_W }}
    >
      <div className="px-3 py-2">
        {/* Ligne code / type — code neutre (la teinte vit dans le rail gauche) */}
        <div className="flex items-center justify-between">
          {numbered ? (
            <span
              className={cn(
                "font-mono text-nano",
                isRoot ? "text-surface/70" : "text-ink-3",
              )}
            >
              {structure.toUpperCase()} · {code}
            </span>
          ) : (
            <span
              className={cn(
                "font-mono text-nano uppercase tracking-[0.14em]",
                isRoot ? "text-surface/70" : "text-ink-3",
              )}
            >
              {isRoot ? "OBS" : "Acteur"}
            </span>
          )}
          <div className="flex items-center gap-1">
            <AnnotationBadge nodeId={node.id} isRoot={isRoot} />
            {canEdit && !isRoot && (
              <button
                onClick={() => onRemove(node.id)}
                aria-label="Supprimer le nœud"
                className={cn(
                  "opacity-0 transition-all active:scale-90 group-hover:opacity-100",
                  isRoot ? "text-surface/70" : "text-ink-4 hover:text-danger",
                )}
              >
                <Trash2 size={13} aria-hidden />
              </button>
            )}
          </div>
        </div>

        {/* Titre éditable */}
        <div
          className={cn(
            "node-title mt-1 rounded-chip font-semibold leading-tight outline-none",
            depth <= 1 ? "text-body" : "text-caption",
            isRoot ? "text-surface" : "text-ink",
            canEdit && !isRoot && "focus:bg-surface-2 focus:text-ink",
            canEdit && "cursor-text",
          )}
          data-placeholder={isObs ? "Nom de l’acteur" : "Sans titre"}
          contentEditable={canEdit}
          suppressContentEditableWarning
          onBlur={(e) => {
            const v = (e.currentTarget.textContent ?? "").trim();
            if (v !== node.name) onCommitName(node.id, v);
          }}
        >
          {node.name}
        </div>

        {/* OBS : responsabilités */}
        {isObs && !isRoot && (
          <ResponsibilitiesField
            node={node}
            canEdit={canEdit}
            onCommit={onCommitMeta}
          />
        )}

        {/* N5 : notes libres à tirets */}
        {isNotesLevel && (
          <Notes
            parentId={node.id}
            notes={notes}
            canEdit={canEdit}
            onAdd={onAddChild}
            onCommit={onCommitName}
            onRemove={onRemove}
          />
        )}

        {/* Ajouter un enfant (boîte) */}
        {canEdit && canAddBox && (
          <button
            onClick={() => onAddChild(node.id)}
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-node border border-dashed px-2 py-0.5 text-nano transition-all duration-[var(--duration-instant)] ease-[var(--ease)] active:scale-95",
              isRoot
                ? "border-surface/40 text-surface/80 hover:bg-surface/10"
                : "border-border-strong text-ink-3 hover:bg-surface-2",
            )}
          >
            <Plus size={11} aria-hidden />
            {isObs ? "Sous-acteur" : depth === 2 ? "N4" : "Ajouter"}
          </button>
        )}
      </div>
    </div>
  );
}

function ResponsibilitiesField({
  node,
  canEdit,
  onCommit,
}: {
  node: BreakdownNode;
  canEdit: boolean;
  onCommit: (id: string, meta: Json) => void;
}) {
  const initial = metaString(node.meta, "responsabilites");
  const [value, setValue] = useState(initial);

  function save() {
    if (value === initial) return;
    const meta: Json = {
      ...((node.meta as Record<string, unknown>) ?? {}),
      responsabilites: value,
    };
    onCommit(node.id, meta);
  }

  if (!canEdit) {
    return initial ? (
      <p className="mt-1.5 text-caption text-ink-2">{initial}</p>
    ) : null;
  }

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      rows={2}
      placeholder="Responsabilités…"
      className="mt-1.5 w-full resize-none rounded-chip border border-border bg-surface px-1.5 py-1 text-caption text-ink outline-none focus:border-border-strong focus:bg-surface-2"
    />
  );
}

function Notes({
  parentId,
  notes,
  canEdit,
  onAdd,
  onCommit,
  onRemove,
}: {
  parentId: string;
  notes: BreakdownNode[];
  canEdit: boolean;
  onAdd: (parentId: string) => void;
  onCommit: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  if (notes.length === 0 && !canEdit) return null;

  return (
    <ul className="mt-1.5 space-y-0.5 border-t border-border-soft pt-1.5">
      {notes.map((n) => (
        <li key={n.id} className="group/note flex items-center gap-1">
          <span className="text-ink-4">–</span>
          {canEdit ? (
            <>
              <input
                defaultValue={n.name}
                placeholder="Note…"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== n.name) onCommit(n.id, v);
                }}
                className="flex-1 rounded-chip border border-transparent bg-transparent px-1 py-0.5 text-caption text-ink outline-none hover:border-border focus:border-border-strong focus:bg-surface-2"
              />
              <button
                onClick={() => onRemove(n.id)}
                aria-label="Supprimer la note"
                className="text-ink-4 opacity-0 transition-all hover:text-danger active:scale-90 group-hover/note:opacity-100"
              >
                <Trash2 size={11} aria-hidden />
              </button>
            </>
          ) : (
            <span className="text-caption text-ink-2">{n.name}</span>
          )}
        </li>
      ))}
      {canEdit && (
        <li>
          <button
            onClick={() => onAdd(parentId)}
            className="inline-flex items-center gap-1 text-nano text-ink-3 transition-all hover:text-ink active:scale-95"
          >
            <Plus size={10} aria-hidden />
            Note
          </button>
        </li>
      )}
    </ul>
  );
}
