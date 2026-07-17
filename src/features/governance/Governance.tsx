"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SLUGS } from "@/lib/slugs";
import type { GovernanceData, Instance } from "./data";
import { saveInstances } from "./actions";
import { RaciMatrix } from "./RaciMatrix";

const EMPTY_INSTANCE: Instance = {
  name: "",
  animateur: "",
  scribe: "",
  acteurs: [],
  frequence: "",
  duree: "",
  objectif: "",
  docs_in: [],
  docs_out: [],
};

export function Governance({
  projectId,
  canEdit,
  initial,
}: {
  projectId: string;
  canEdit: boolean;
  initial: GovernanceData;
}) {
  const [instances, setInstances] = useState<Instance[]>(initial.instances);
  const ref = useRef(instances);
  const [, startTransition] = useTransition();

  function update(next: Instance[]) {
    ref.current = next;
    setInstances(next);
  }
  function persist() {
    startTransition(() => saveInstances(projectId, ref.current));
  }
  function setField<K extends keyof Instance>(
    i: number,
    key: K,
    value: Instance[K],
  ) {
    update(instances.map((inst, k) => (k === i ? { ...inst, [key]: value } : inst)));
  }
  function commitField<K extends keyof Instance>(
    i: number,
    key: K,
    value: Instance[K],
  ) {
    const next = instances.map((inst, k) =>
      k === i ? { ...inst, [key]: value } : inst,
    );
    update(next);
    persist();
  }
  function addInstance() {
    update([...instances, { ...EMPTY_INSTANCE, name: "Nouvelle réunion" }]);
    persist();
  }
  function removeInstance(i: number) {
    update(instances.filter((_, k) => k !== i));
    persist();
  }

  return (
    <main
      data-slug={SLUGS.governanceBoard}
      className="mx-auto max-w-4xl px-6 py-8 pt-14 sm:px-10 lg:pt-8"
    >
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title text-ink">Gouvernance</h2>
          <p className="mt-1 text-body text-ink-2">
            Instances de pilotage (COPIL → COPROJ → opérationnel) et matrice
            RACI.
          </p>
        </div>
        {canEdit && (
          <Button onClick={addInstance} className="shrink-0">
            <Plus size={14} aria-hidden />
            Réunion
          </Button>
        )}
      </header>

      {instances.length === 0 ? (
        <div className="rounded-pop border border-dashed border-border-strong bg-surface-2 px-6 py-10 text-center">
          <p className="text-section text-ink">Aucune instance définie.</p>
          <p className="mt-1 text-body text-ink-2">
            {canEdit
              ? "Ajoutez une réunion : COPIL, comité projet, point opérationnel…"
              : "Le PMO n’a pas encore défini d’instance de pilotage."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {instances.map((inst, i) => (
            <InstanceCard
              key={i}
              instance={inst}
              canEdit={canEdit}
              onField={(key, value) => setField(i, key, value)}
              onCommit={(key, value) => commitField(i, key, value)}
              onBlur={persist}
              onRemove={() => removeInstance(i)}
            />
          ))}
        </div>
      )}

      <RaciMatrix projectId={projectId} canEdit={canEdit} initial={initial.raci} />
    </main>
  );
}

function InstanceCard({
  instance,
  canEdit,
  onField,
  onCommit,
  onBlur,
  onRemove,
}: {
  instance: Instance;
  canEdit: boolean;
  onField: <K extends keyof Instance>(key: K, value: Instance[K]) => void;
  onCommit: <K extends keyof Instance>(key: K, value: Instance[K]) => void;
  onBlur: () => void;
  onRemove: () => void;
}) {
  return (
    <Card as="article" data-slug={SLUGS.instanceCard} className="animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        {canEdit ? (
          <input
            value={instance.name}
            onChange={(e) => onField("name", e.target.value)}
            onBlur={onBlur}
            placeholder="Nom de la réunion"
            className="flex-1 rounded-node border border-transparent bg-transparent px-1 py-0.5 text-section font-semibold text-ink outline-none hover:border-border focus:border-border-strong focus:bg-surface-2"
          />
        ) : (
          <h3 className="text-section text-ink">
            {instance.name || "Réunion"}
          </h3>
        )}
        {canEdit && (
          <button
            onClick={onRemove}
            aria-label="Supprimer la réunion"
            className="shrink-0 rounded-node p-1 text-ink-4 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 hover:text-danger active:scale-90"
          >
            <Trash2 size={15} aria-hidden />
          </button>
        )}
      </div>

      {/* Animateur / Scribe */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <RoleField
          label="Animateur"
          dot="bg-status-progress"
          value={instance.animateur}
          canEdit={canEdit}
          onChange={(v) => onField("animateur", v)}
          onBlur={onBlur}
        />
        <RoleField
          label="Scribe"
          dot="bg-raci-c"
          value={instance.scribe}
          canEdit={canEdit}
          onChange={(v) => onField("scribe", v)}
          onBlur={onBlur}
        />
      </div>

      {/* Fréquence / Durée */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field
          label="Fréquence"
          value={instance.frequence}
          placeholder="Ex. Mensuel"
          canEdit={canEdit}
          onChange={(v) => onField("frequence", v)}
          onBlur={onBlur}
        />
        <Field
          label="Durée"
          value={instance.duree}
          placeholder="Ex. 60 min"
          canEdit={canEdit}
          onChange={(v) => onField("duree", v)}
          onBlur={onBlur}
        />
      </div>

      {/* Objectif */}
      <div className="mt-3">
        <span className="label-mono text-nano">Objectif</span>
        {canEdit ? (
          <textarea
            value={instance.objectif}
            onChange={(e) => onField("objectif", e.target.value)}
            onBlur={onBlur}
            rows={2}
            placeholder="But de la réunion…"
            className="mt-1 w-full resize-y rounded-node border border-border bg-surface px-2 py-1.5 text-body text-ink outline-none focus:border-border-strong focus:bg-surface-2"
          />
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-body text-ink">
            {instance.objectif || "—"}
          </p>
        )}
      </div>

      {/* Acteurs */}
      <div className="mt-3">
        <StringList
          label="Acteurs"
          items={instance.acteurs}
          placeholder="Ajouter un participant…"
          canEdit={canEdit}
          onChange={(items) => onCommit("acteurs", items)}
        />
      </div>

      {/* Documents IN / OUT */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <StringList
          label="Documents IN"
          items={instance.docs_in}
          placeholder="Document d’entrée…"
          canEdit={canEdit}
          onChange={(items) => onCommit("docs_in", items)}
        />
        <StringList
          label="Documents OUT"
          items={instance.docs_out}
          placeholder="Document de sortie…"
          canEdit={canEdit}
          onChange={(items) => onCommit("docs_out", items)}
        />
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  placeholder,
  canEdit,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  placeholder?: string;
  canEdit: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="block">
      <span className="label-mono text-nano">{label}</span>
      {canEdit ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="mt-1 w-full rounded-node border border-border bg-surface px-2 py-1.5 text-body text-ink outline-none focus:border-border-strong focus:bg-surface-2"
        />
      ) : (
        <p className="mt-1 text-body text-ink">{value || "—"}</p>
      )}
    </label>
  );
}

function RoleField({
  label,
  dot,
  value,
  canEdit,
  onChange,
  onBlur,
}: {
  label: string;
  dot: string;
  value: string;
  canEdit: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="block">
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
        <span className="label-mono text-nano">{label}</span>
      </span>
      {canEdit ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Nom"
          className="mt-1 w-full rounded-node border border-border bg-surface px-2 py-1.5 text-body text-ink outline-none focus:border-border-strong focus:bg-surface-2"
        />
      ) : (
        <p className="mt-1 text-body text-ink">{value || "—"}</p>
      )}
    </label>
  );
}

function StringList({
  label,
  items,
  placeholder,
  canEdit,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder: string;
  canEdit: boolean;
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    setDraft("");
    onChange([...items, v]);
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <span className="label-mono text-nano">{label}</span>
      <ul className="mt-1 space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="group/it flex items-center gap-1.5">
            <span className="text-ink-4">–</span>
            <span className="flex-1 text-body text-ink">{it}</span>
            {canEdit && (
              <button
                onClick={() => remove(i)}
                aria-label="Retirer"
                className="text-ink-4 opacity-0 transition-all hover:text-danger active:scale-90 group-hover/it:opacity-100"
              >
                <X size={13} aria-hidden />
              </button>
            )}
          </li>
        ))}
        {items.length === 0 && !canEdit && (
          <li className="text-body text-ink-3">—</li>
        )}
      </ul>
      {canEdit && (
        <div className="mt-1 flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
            className="flex-1 rounded-node border border-dashed border-border-strong bg-surface-2 px-2 py-1 text-body outline-none focus:border-ink-4"
          />
          <button
            onClick={add}
            aria-label="Ajouter"
            className="shrink-0 rounded-node border border-border-strong p-1 text-ink-2 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 active:scale-90"
          >
            <Plus size={13} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
