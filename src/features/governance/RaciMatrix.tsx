"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";
import type { Raci } from "./data";
import { saveRaci } from "./actions";

const CYCLE = ["", "R", "A", "C", "I"] as const;

const CELL_STYLE: Record<string, string> = {
  R: "bg-raci-r-soft text-raci-r-text",
  A: "bg-raci-a-soft text-raci-a-text",
  C: "bg-raci-c-soft text-raci-c-text",
  I: "bg-raci-i-soft text-raci-i-text",
  "": "text-ink-4",
};

const LEGEND = [
  { k: "R", label: "Réalise" },
  { k: "A", label: "Approuve" },
  { k: "C", label: "Consulté" },
  { k: "I", label: "Informé" },
];

export function RaciMatrix({
  projectId,
  canEdit,
  initial,
}: {
  projectId: string;
  canEdit: boolean;
  initial: Raci;
}) {
  const [raci, setRaci] = useState<Raci>(initial);
  const [roleDraft, setRoleDraft] = useState("");
  const [lotDraft, setLotDraft] = useState("");
  const [, startTransition] = useTransition();

  function commit(next: Raci) {
    setRaci(next);
    startTransition(() => saveRaci(projectId, next));
  }

  function cycleCell(lotIdx: number, roleIdx: number) {
    const next: Raci = {
      roles: [...raci.roles],
      lots: raci.lots.map((l) => ({ name: l.name, v: [...l.v] })),
    };
    const cur = next.lots[lotIdx].v[roleIdx] ?? "";
    const pos = CYCLE.indexOf(cur as (typeof CYCLE)[number]);
    next.lots[lotIdx].v[roleIdx] = CYCLE[(pos + 1) % CYCLE.length];
    commit(next);
  }

  function addRole() {
    const name = roleDraft.trim();
    if (!name) return;
    setRoleDraft("");
    commit({
      roles: [...raci.roles, name],
      lots: raci.lots.map((l) => ({ name: l.name, v: [...l.v, ""] })),
    });
  }

  function removeRole(idx: number) {
    commit({
      roles: raci.roles.filter((_, i) => i !== idx),
      lots: raci.lots.map((l) => ({
        name: l.name,
        v: l.v.filter((_, i) => i !== idx),
      })),
    });
  }

  function addLot() {
    const name = lotDraft.trim();
    if (!name) return;
    setLotDraft("");
    commit({
      roles: [...raci.roles],
      lots: [...raci.lots, { name, v: raci.roles.map(() => "") }],
    });
  }

  function removeLot(idx: number) {
    commit({
      roles: [...raci.roles],
      lots: raci.lots.filter((_, i) => i !== idx),
    });
  }

  const empty = raci.roles.length === 0 && raci.lots.length === 0;

  return (
    <section data-slug={SLUGS.raciMatrix} className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-section text-ink">Matrice RACI</h3>
        <div className="flex flex-wrap gap-1.5">
          {LEGEND.map((l) => (
            <span
              key={l.k}
              className={cn(
                "rounded-chip px-1.5 py-0.5 font-mono text-nano",
                CELL_STYLE[l.k],
              )}
            >
              {l.k} · {l.label}
            </span>
          ))}
        </div>
      </div>

      {empty && !canEdit ? (
        <p className="text-body text-ink-3">Aucune matrice définie.</p>
      ) : (
        <div className="overflow-x-auto rounded-node border border-border">
          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="bg-surface-2">
                <th className="min-w-40 border-b border-border px-3 py-2 text-left">
                  <span className="label-mono text-nano">Lot \ Rôle</span>
                </th>
                {raci.roles.map((role, j) => (
                  <th
                    key={j}
                    className="border-b border-l border-border px-2 py-2 text-center align-bottom"
                  >
                    {canEdit ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          defaultValue={role}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v && v !== role) {
                              const roles = [...raci.roles];
                              roles[j] = v;
                              commit({ roles, lots: raci.lots });
                            }
                          }}
                          className="w-20 rounded-chip border border-transparent bg-transparent px-1 py-0.5 text-center text-caption hover:border-border focus:border-border-strong focus:bg-surface"
                        />
                        <button
                          onClick={() => removeRole(j)}
                          aria-label="Retirer le rôle"
                          className="text-ink-4 hover:text-danger"
                        >
                          <X size={12} aria-hidden />
                        </button>
                      </div>
                    ) : (
                      <span className="text-caption text-ink-2">{role}</span>
                    )}
                  </th>
                ))}
                {canEdit && (
                  <th className="border-b border-l border-border px-2 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        value={roleDraft}
                        onChange={(e) => setRoleDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRole();
                          }
                        }}
                        placeholder="+ rôle"
                        className="w-20 rounded-chip border border-dashed border-border-strong bg-surface-2 px-1 py-0.5 text-center text-caption outline-none"
                      />
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {raci.lots.map((lot, i) => (
                <tr key={i} className="hover:bg-surface-2">
                  <td className="border-b border-border px-3 py-1.5">
                    {canEdit ? (
                      <div className="flex items-center gap-1">
                        <input
                          defaultValue={lot.name}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v && v !== lot.name) {
                              const lots = raci.lots.map((l, k) =>
                                k === i ? { ...l, name: v } : l,
                              );
                              commit({ roles: raci.roles, lots });
                            }
                          }}
                          className="flex-1 rounded-chip border border-transparent bg-transparent px-1 py-0.5 text-body hover:border-border focus:border-border-strong focus:bg-surface-2"
                        />
                        <button
                          onClick={() => removeLot(i)}
                          aria-label="Retirer le lot"
                          className="text-ink-4 hover:text-danger"
                        >
                          <X size={12} aria-hidden />
                        </button>
                      </div>
                    ) : (
                      <span className="text-body text-ink">{lot.name}</span>
                    )}
                  </td>
                  {raci.roles.map((_, j) => {
                    const val = lot.v[j] ?? "";
                    return (
                      <td
                        key={j}
                        className="border-b border-l border-border p-1 text-center"
                      >
                        <button
                          disabled={!canEdit}
                          onClick={() => canEdit && cycleCell(i, j)}
                          className={cn(
                            "mx-auto flex h-6 w-6 items-center justify-center rounded-chip font-mono text-caption",
                            CELL_STYLE[val],
                            canEdit && "hover:ring-1 hover:ring-border-strong",
                          )}
                        >
                          {val || "·"}
                        </button>
                      </td>
                    );
                  })}
                  {canEdit && <td className="border-b border-border" />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canEdit && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            value={lotDraft}
            onChange={(e) => setLotDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLot();
              }
            }}
            placeholder="Ajouter un lot de travail…"
            className="max-w-xs flex-1 rounded-node border border-dashed border-border-strong bg-surface-2 px-2 py-1 text-body outline-none focus:border-ink-4"
          />
          <button
            onClick={addLot}
            aria-label="Ajouter le lot"
            className="rounded-node border border-border-strong p-1.5 text-ink-2 hover:bg-surface-2"
          >
            <Plus size={14} aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
