"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { SLUGS } from "@/lib/slugs";

/** Un id optimiste (avant retour serveur) porte le préfixe `temp-`. */
const isPending = (id: string) => id.startsWith("temp-");
const tempId = () => `temp-${crypto.randomUUID()}`;
import type { Enums, Json } from "@/lib/supabase/types";
import type { SixpackData, SixpackItem } from "./data";
import {
  addSixpackItem,
  deleteSixpackItem,
  updateSixpackItem,
  updateSixpackProse,
} from "./actions";

type Kind = Enums<"sixpack_kind">;

const INPUT =
  "w-full rounded-node border border-transparent bg-transparent px-2 py-1 text-body text-ink outline-none hover:border-border focus:border-border-strong focus:bg-surface-2";
const ADD_INPUT =
  "w-full rounded-node border border-dashed border-border-strong bg-surface-2 px-2 py-1 text-body text-ink outline-none focus:border-ink-4";

export function SixPack({
  projectId,
  canEdit,
  initial,
}: {
  projectId: string;
  canEdit: boolean;
  initial: SixpackData;
}) {
  const byKind = (k: Kind) => initial.items.filter((i) => i.kind === k);

  return (
    <div
      data-slug={SLUGS.sixPack}
      className="mx-auto max-w-4xl px-6 py-8 pt-14 sm:px-10 lg:pt-8"
    >
      <header className="mb-6">
        <h2 className="text-title text-ink">6-Pack</h2>
        <p className="mt-1 text-body text-ink-2">
          Le brief structuré : la matière à partir de laquelle on construit les
          arbres et la gouvernance.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProseBlock
          projectId={projectId}
          canEdit={canEdit}
          field="contexte"
          title="Contexte & enjeux"
          description="Pourquoi ce projet ? (optionnel)"
          accent="bg-ink-4"
          initialValue={initial.contexte}
          className="lg:col-span-2"
        />

        <SimpleListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="objective"
          title="Objectifs"
          description="Résultats visés, idéalement SMART."
          placeholder="Ajouter un objectif…"
          dotClass="bg-status-progress"
          accent="bg-status-progress"
          initial={byKind("objective")}
        />

        <SimpleListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="deliverable"
          title="Résultats / livrables attendus"
          description="Produits concrets à sortir."
          placeholder="Ajouter un livrable…"
          dotClass="bg-raci-a"
          accent="bg-raci-a"
          initial={byKind("deliverable")}
        />

        <PairListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="stakeholder"
          title="Parties prenantes"
          description="Nom + rôle."
          metaKey="role"
          extraType="text"
          labelPlaceholder="Nom"
          extraPlaceholder="Rôle"
          accent="bg-raci-c"
          initial={byKind("stakeholder")}
        />

        <PairListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="milestone"
          title="Jalons & échéances"
          description="Label + date / repère."
          metaKey="date"
          extraType="date"
          labelPlaceholder="Jalon"
          extraPlaceholder=""
          accent="bg-raci-i"
          initial={byKind("milestone")}
        />

        <SimpleListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="scope_in"
          title="Périmètre — dans le projet (IN)"
          description="Ce qui est explicitement inclus."
          placeholder="Ajouter au périmètre IN…"
          dotClass="bg-status-done"
          accent="bg-team-1"
          initial={byKind("scope_in")}
        />

        <SimpleListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="scope_out"
          title="Périmètre — hors projet (OUT)"
          description="Ce qui est explicitement exclu (anti scope creep)."
          placeholder="Ajouter au périmètre OUT…"
          dotClass="bg-ink-4"
          accent="bg-ink-4"
          initial={byKind("scope_out")}
        />

        <ProseBlock
          projectId={projectId}
          canEdit={canEdit}
          field="contraintes"
          title="Contraintes & risques"
          description="Budget, normes, dépendances…"
          accent="bg-risk-high"
          initialValue={initial.contraintes}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}

function BlockCard({
  title,
  description,
  accent = "bg-ink-4",
  children,
  className,
}: {
  title: string;
  description?: string;
  accent?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      as="section"
      data-slug={SLUGS.sixPackBlock}
      className={className}
    >
      <header className="mb-3">
        <p className="label-mono text-nano flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-[2px]", accent)} aria-hidden />
          {title}
        </p>
        {description && (
          <p className="mt-1 text-caption text-ink-3">{description}</p>
        )}
      </header>
      {children}
    </Card>
  );
}

function ProseBlock({
  projectId,
  canEdit,
  field,
  title,
  description,
  accent,
  initialValue,
  className,
}: {
  projectId: string;
  canEdit: boolean;
  field: "contexte" | "contraintes";
  title: string;
  description?: string;
  accent?: string;
  initialValue: string;
  className?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [, startTransition] = useTransition();

  function save() {
    if (value === saved) return;
    setSaved(value);
    startTransition(() => updateSixpackProse(projectId, field, value));
  }

  return (
    <BlockCard title={title} description={description} accent={accent} className={className}>
      {canEdit ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          rows={4}
          placeholder="Rédiger…"
          className="w-full resize-y rounded-node border border-border-strong bg-surface px-2.5 py-[7px] text-body text-ink outline-none placeholder:text-ink-5 focus:border-ink-4 focus:bg-surface-2"
        />
      ) : value ? (
        <p className="whitespace-pre-wrap text-body text-ink">{value}</p>
      ) : (
        <p className="text-body text-ink-3">Non renseigné.</p>
      )}
    </BlockCard>
  );
}

function SimpleListBlock({
  projectId,
  canEdit,
  kind,
  title,
  description,
  placeholder,
  initial,
  dotClass = "bg-ink-4",
  accent,
  className,
}: {
  projectId: string;
  canEdit: boolean;
  kind: Kind;
  title: string;
  description?: string;
  placeholder: string;
  initial: SixpackItem[];
  dotClass?: string;
  accent?: string;
  className?: string;
}) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();

  // Ajout optimiste : l'élément apparaît immédiatement (id `temp-`), puis on
  // réconcilie avec la ligne réelle renvoyée par le serveur.
  function add() {
    const label = draft.trim();
    if (!label) return;
    setDraft("");
    const id = tempId();
    setItems((prev) => [
      ...prev,
      { id, project_id: projectId, kind, label, meta: {}, position: prev.length },
    ]);
    (async () => {
      try {
        const row = await addSixpackItem(projectId, kind, label);
        setItems((prev) => prev.map((i) => (i.id === id ? row : i)));
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    })();
  }

  function commit(id: string, label: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)));
    startTransition(() => updateSixpackItem(projectId, id, label));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => deleteSixpackItem(projectId, id));
  }

  return (
    <BlockCard title={title} description={description} accent={accent} className={className}>
      <ul className="space-y-1">
        {items.map((it) => (
          <li
            key={it.id}
            className={cn(
              "group animate-fade-in-up flex items-center gap-2 transition-opacity",
              isPending(it.id) && "opacity-55",
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)}
              aria-hidden
            />
            {canEdit ? (
              <input
                defaultValue={it.label}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== it.label) commit(it.id, v);
                  else if (!v) e.target.value = it.label;
                }}
                className={INPUT}
              />
            ) : (
              <span className="flex-1 text-body text-ink">{it.label}</span>
            )}
            {canEdit &&
              (isPending(it.id) ? (
                <Spinner size={12} className="mr-0.5 text-ink-4" />
              ) : (
                <button
                  onClick={() => remove(it.id)}
                  aria-label="Supprimer"
                  className="text-ink-4 opacity-0 transition-all hover:text-danger active:scale-90 group-hover:opacity-100"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              ))}
          </li>
        ))}
        {items.length === 0 && !canEdit && (
          <li className="text-body text-ink-3">Non renseigné.</li>
        )}
      </ul>

      {canEdit && (
        <div className="mt-2 flex items-center gap-1.5">
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
            className={ADD_INPUT}
          />
          <button
            onClick={add}
            aria-label="Ajouter"
            className="shrink-0 rounded-node border border-border-strong p-1.5 text-ink-2 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 active:scale-90"
          >
            <Plus size={14} aria-hidden />
          </button>
        </div>
      )}
    </BlockCard>
  );
}

function PairListBlock({
  projectId,
  canEdit,
  kind,
  title,
  description,
  metaKey,
  extraType,
  labelPlaceholder,
  extraPlaceholder,
  initial,
  accent,
  className,
}: {
  projectId: string;
  canEdit: boolean;
  kind: Kind;
  title: string;
  description?: string;
  metaKey: "role" | "date";
  extraType: "text" | "date";
  labelPlaceholder: string;
  extraPlaceholder: string;
  initial: SixpackItem[];
  accent?: string;
  className?: string;
}) {
  const [items, setItems] = useState(initial);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftExtra, setDraftExtra] = useState("");
  const [, startTransition] = useTransition();

  const extraOf = (it: SixpackItem): string => {
    const m = it.meta as Record<string, unknown> | null;
    const v = m?.[metaKey];
    return typeof v === "string" ? v : "";
  };

  function add() {
    const label = draftLabel.trim();
    if (!label) return;
    const meta: Json = { [metaKey]: draftExtra.trim() };
    setDraftLabel("");
    setDraftExtra("");
    const id = tempId();
    setItems((prev) => [
      ...prev,
      { id, project_id: projectId, kind, label, meta, position: prev.length },
    ]);
    (async () => {
      try {
        const row = await addSixpackItem(projectId, kind, label, meta);
        setItems((prev) => prev.map((i) => (i.id === id ? row : i)));
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    })();
  }

  function commit(id: string, label: string, extra: string) {
    const meta: Json = { [metaKey]: extra };
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, label, meta } : i)),
    );
    startTransition(() => updateSixpackItem(projectId, id, label, meta));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => deleteSixpackItem(projectId, id));
  }

  return (
    <BlockCard title={title} description={description} accent={accent} className={className}>
      <ul className="space-y-1">
        {items.map((it) => (
          <PairRow
            key={it.id}
            canEdit={canEdit}
            pending={isPending(it.id)}
            label={it.label}
            extra={extraOf(it)}
            extraType={extraType}
            labelPlaceholder={labelPlaceholder}
            extraPlaceholder={extraPlaceholder}
            onCommit={(l, e) => commit(it.id, l, e)}
            onDelete={() => remove(it.id)}
          />
        ))}
        {items.length === 0 && !canEdit && (
          <li className="text-body text-ink-3">Non renseigné.</li>
        )}
      </ul>

      {canEdit && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={labelPlaceholder}
            className={ADD_INPUT}
          />
          <input
            type={extraType}
            value={draftExtra}
            onChange={(e) => setDraftExtra(e.target.value)}
            placeholder={extraPlaceholder}
            className={cn(
              ADD_INPUT,
              "shrink-0",
              extraType === "date" ? "w-36 font-mono text-caption" : "w-32",
            )}
          />
          <button
            onClick={add}
            aria-label="Ajouter"
            className="shrink-0 rounded-node border border-border-strong p-1.5 text-ink-2 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 active:scale-90"
          >
            <Plus size={14} aria-hidden />
          </button>
        </div>
      )}
    </BlockCard>
  );
}

function PairRow({
  canEdit,
  pending = false,
  label,
  extra,
  extraType,
  labelPlaceholder,
  extraPlaceholder,
  onCommit,
  onDelete,
}: {
  canEdit: boolean;
  pending?: boolean;
  label: string;
  extra: string;
  extraType: "text" | "date";
  labelPlaceholder: string;
  extraPlaceholder: string;
  onCommit: (label: string, extra: string) => void;
  onDelete: () => void;
}) {
  const [l, setL] = useState(label);
  const [e, setE] = useState(extra);

  function maybeCommit() {
    if (l.trim() && (l.trim() !== label || e.trim() !== extra)) {
      onCommit(l.trim(), e.trim());
    }
  }

  if (!canEdit) {
    return (
      <li className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-4" aria-hidden />
        <span className="flex-1 text-body text-ink">{label}</span>
        {extra && (
          <span className="font-mono text-caption text-ink-3">{extra}</span>
        )}
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group animate-fade-in-up flex items-center gap-1.5 transition-opacity",
        pending && "opacity-55",
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-4" aria-hidden />
      <input
        value={l}
        onChange={(ev) => setL(ev.target.value)}
        onBlur={maybeCommit}
        placeholder={labelPlaceholder}
        className={INPUT}
      />
      <input
        type={extraType}
        value={e}
        onChange={(ev) => setE(ev.target.value)}
        onBlur={maybeCommit}
        placeholder={extraPlaceholder}
        className={cn(
          INPUT,
          "shrink-0",
          extraType === "date" ? "w-36 font-mono text-caption" : "w-32",
        )}
      />
      {pending ? (
        <Spinner size={12} className="mr-0.5 text-ink-4" />
      ) : (
        <button
          onClick={onDelete}
          aria-label="Supprimer"
          className="text-ink-4 opacity-0 transition-all hover:text-danger active:scale-90 group-hover:opacity-100"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}
