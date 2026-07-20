"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
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

/* ── Vocabulaire de classes (source unique, min-w-0 partout pour ne jamais
   déborder : les inputs ont un `min-width` explicite, ce qui neutralise le
   `min-width:auto` du flex — la cause du champ date qui écrasait le libellé). */

// Champ d'édition en ligne (libellé principal d'un item). Transparent au repos,
// se révèle au survol/focus.
const ROW_INPUT =
  "min-w-0 flex-1 rounded-node border border-transparent bg-transparent px-2 py-1 text-body text-ink outline-none transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease)] hover:border-border focus:border-border-strong focus:bg-surface-2";

// Champ secondaire (rôle, date) : allure de pastille inset, plus discret.
const META_INPUT =
  "min-w-0 rounded-node border border-transparent bg-surface-2 px-2 py-1 text-caption text-ink-2 outline-none transition-[background-color,border-color,color] duration-[var(--duration-fast)] ease-[var(--ease)] hover:border-border focus:border-border-strong focus:text-ink";

// Champ d'ajout : tirets, invite à la saisie.
const ADD_INPUT =
  "min-w-0 flex-1 rounded-node border border-dashed border-border-strong bg-surface-2 px-2.5 py-1.5 text-body text-ink outline-none transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-5 focus:border-ink-4 focus:bg-surface";

const ADD_META_INPUT =
  "min-w-0 rounded-node border border-dashed border-border-strong bg-surface-2 px-2.5 py-1.5 text-caption text-ink-2 outline-none transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-5 focus:border-ink-4 focus:bg-surface";

const ADD_BTN =
  "grid size-8 shrink-0 place-items-center rounded-node border border-border-strong text-ink-2 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:border-ink-4 hover:bg-surface-2 hover:text-ink active:scale-90 disabled:pointer-events-none disabled:opacity-40";

const DEL_BTN =
  "grid size-6 shrink-0 place-items-center rounded-node text-ink-4 opacity-0 transition-all duration-[var(--duration-fast)] ease-[var(--ease)] hover:text-danger focus-visible:opacity-100 active:scale-90 group-hover:opacity-100";

const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** `2026-07-20` → `20 juil. 2026` (parse manuel : pas de décalage UTC). */
function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS_FR[Number(m[2]) - 1]} ${m[1]}`;
}

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
      <header className="mb-6 animate-fade-in">
        <h2 className="text-title text-ink">6-Pack</h2>
        <p className="mt-1 text-body text-ink-2">
          Le brief structuré : la matière à partir de laquelle on construit les
          arbres et la gouvernance.
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <ProseBlock
          projectId={projectId}
          canEdit={canEdit}
          field="contexte"
          title="Contexte & enjeux"
          description="Pourquoi ce projet ? (optionnel)"
          accent="bg-ink-4"
          initialValue={initial.contexte}
          placeholder="Le contexte, les enjeux, l'origine du besoin…"
          className="lg:col-span-2"
        />

        <SimpleListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="objective"
          title="Objectifs"
          description="Résultats visés, idéalement SMART."
          placeholder="Ajouter un objectif…"
          emptyHint="Aucun objectif — commencez par le résultat visé."
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
          emptyHint="Aucun livrable — nommez un produit concret à sortir."
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
          emptyHint="Aucune partie prenante — ajoutez un nom et son rôle."
          accent="bg-raci-c"
          dotClass="bg-raci-c"
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
          emptyHint="Aucun jalon — posez une première échéance."
          accent="bg-raci-i"
          dotClass="bg-raci-i"
          initial={byKind("milestone")}
        />

        <SimpleListBlock
          projectId={projectId}
          canEdit={canEdit}
          kind="scope_in"
          title="Périmètre — dans le projet (IN)"
          description="Ce qui est explicitement inclus."
          placeholder="Ajouter au périmètre IN…"
          emptyHint="Rien d'inclus pour l'instant."
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
          emptyHint="Rien d'exclu — cadrez ce qui reste dehors."
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
          placeholder="Budget, normes, dépendances, risques identifiés…"
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
  count,
  children,
  className,
}: {
  title: string;
  description?: string;
  accent?: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      as="section"
      data-slug={SLUGS.sixPackBlock}
      className={cn(
        "animate-fade-in-up transition-colors duration-[var(--duration-base)] focus-within:border-border-strong",
        className,
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-mono text-nano flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-[2px]", accent)} aria-hidden />
            {title}
          </p>
          {description && (
            <p className="mt-1 text-caption text-ink-3">{description}</p>
          )}
        </div>
        {count != null && count > 0 && (
          <span className="label-mono text-nano mt-px shrink-0 tabular-nums text-ink-4">
            {count}
          </span>
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
  placeholder,
  className,
}: {
  projectId: string;
  canEdit: boolean;
  field: "contexte" | "contraintes";
  title: string;
  description?: string;
  accent?: string;
  initialValue: string;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(initialValue);
  const [flash, setFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Optimiste : on marque « enregistré » dès la sortie du champ, on écrit en
  // arrière-plan, et on ne confirme (« Enregistré ✓ ») qu'au retour serveur.
  // En cas d'échec réel, on rouvre la sauvegarde pour qu'un prochain blur réessaie.
  function save() {
    const next = value;
    if (next === saved) return;
    const previous = saved;
    setSaved(next);
    (async () => {
      try {
        await updateSixpackProse(projectId, field, next);
        setFlash(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setFlash(false), 1800);
      } catch {
        setSaved(previous);
      }
    })();
  }

  return (
    <BlockCard
      title={title}
      description={description}
      accent={accent}
      className={className}
    >
      {canEdit ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            rows={4}
            placeholder={placeholder ?? "Rédiger…"}
            className="w-full resize-y rounded-node border border-border-strong bg-surface px-2.5 py-[7px] text-body text-ink outline-none transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-5 focus:border-ink-4 focus:bg-surface-2"
          />
          <span
            aria-live="polite"
            className={cn(
              "pointer-events-none absolute bottom-2.5 right-3 flex items-center gap-1 text-nano text-status-done-text transition-opacity duration-[var(--duration-base)]",
              flash ? "opacity-100" : "opacity-0",
            )}
          >
            <Check size={11} aria-hidden />
            Enregistré
          </span>
        </div>
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
  emptyHint,
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
  emptyHint?: string;
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
    <BlockCard
      title={title}
      description={description}
      accent={accent}
      count={items.length}
      className={className}
    >
      {items.length === 0 && (
        <p className="mb-2 text-caption text-ink-4">
          {canEdit ? emptyHint : "Non renseigné."}
        </p>
      )}

      <ul className="space-y-0.5">
        {items.map((it) => (
          <li
            key={it.id}
            className={cn(
              "group -mx-1 flex animate-fade-in-up items-center gap-2 rounded-node px-1 py-0.5 transition-[opacity,background-color] duration-[var(--duration-fast)] hover:bg-surface-3",
              isPending(it.id) && "opacity-55",
            )}
          >
            <span
              className={cn("size-1.5 shrink-0 rounded-full", dotClass)}
              aria-hidden
            />
            {canEdit ? (
              <input
                defaultValue={it.label}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== it.label) commit(it.id, v);
                  else if (!v) e.target.value = it.label;
                }}
                className={ROW_INPUT}
              />
            ) : (
              <span className="flex-1 text-body text-ink">{it.label}</span>
            )}
            {canEdit &&
              (isPending(it.id) ? (
                <Spinner size={12} className="mr-1 text-ink-4" />
              ) : (
                <button
                  onClick={() => remove(it.id)}
                  aria-label="Supprimer"
                  className={DEL_BTN}
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              ))}
          </li>
        ))}
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
            disabled={!draft.trim()}
            aria-label="Ajouter"
            className={ADD_BTN}
          >
            <Plus size={16} aria-hidden />
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
  emptyHint,
  initial,
  accent,
  dotClass = "bg-ink-4",
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
  emptyHint?: string;
  initial: SixpackItem[];
  accent?: string;
  dotClass?: string;
  className?: string;
}) {
  const [items, setItems] = useState(initial);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftExtra, setDraftExtra] = useState("");
  const [, startTransition] = useTransition();
  const labelRef = useRef<HTMLInputElement>(null);

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
    labelRef.current?.focus();
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
    <BlockCard
      title={title}
      description={description}
      accent={accent}
      count={items.length}
      className={className}
    >
      {items.length === 0 && (
        <p className="mb-2 text-caption text-ink-4">
          {canEdit ? emptyHint : "Non renseigné."}
        </p>
      )}

      <ul className="space-y-0.5">
        {items.map((it) => (
          <PairRow
            key={it.id}
            canEdit={canEdit}
            pending={isPending(it.id)}
            dotClass={dotClass}
            label={it.label}
            extra={extraOf(it)}
            extraType={extraType}
            labelPlaceholder={labelPlaceholder}
            extraPlaceholder={extraPlaceholder}
            onCommit={(l, e) => commit(it.id, l, e)}
            onDelete={() => remove(it.id)}
          />
        ))}
      </ul>

      {canEdit && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <input
            ref={labelRef}
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={labelPlaceholder}
            className={cn(ADD_INPUT, "basis-32")}
          />
          <input
            type={extraType}
            value={draftExtra}
            onChange={(e) => setDraftExtra(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={extraPlaceholder || undefined}
            aria-label={metaKey === "date" ? "Date du jalon" : "Rôle"}
            className={cn(
              ADD_META_INPUT,
              extraType === "date" ? "w-[8.5rem] font-mono" : "w-28 flex-1",
            )}
          />
          <button
            onClick={add}
            disabled={!draftLabel.trim()}
            aria-label="Ajouter"
            className={ADD_BTN}
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>
      )}
    </BlockCard>
  );
}

function PairRow({
  canEdit,
  pending = false,
  dotClass,
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
  dotClass: string;
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
    } else if (!l.trim()) {
      setL(label);
    }
  }

  if (!canEdit) {
    return (
      <li className="-mx-1 flex items-center gap-2 rounded-node px-1 py-0.5">
        <span className={cn("size-1.5 shrink-0 rounded-full", dotClass)} aria-hidden />
        <span className="min-w-0 flex-1 truncate text-body text-ink">{label}</span>
        {extra && (
          <span className="shrink-0 font-mono text-caption text-ink-3">
            {extraType === "date" ? formatDate(extra) : extra}
          </span>
        )}
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group -mx-1 flex animate-fade-in-up flex-wrap items-center gap-1.5 rounded-node px-1 py-0.5 transition-[opacity,background-color] duration-[var(--duration-fast)] hover:bg-surface-3",
        pending && "opacity-55",
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotClass)} aria-hidden />
      <input
        value={l}
        onChange={(ev) => setL(ev.target.value)}
        onKeyDown={(ev) => {
          if (ev.key === "Enter") ev.currentTarget.blur();
        }}
        onBlur={maybeCommit}
        placeholder={labelPlaceholder}
        className={cn(ROW_INPUT, "basis-28")}
      />
      <input
        type={extraType}
        value={e}
        onChange={(ev) => setE(ev.target.value)}
        onKeyDown={(ev) => {
          if (ev.key === "Enter") ev.currentTarget.blur();
        }}
        onBlur={maybeCommit}
        placeholder={extraPlaceholder || undefined}
        aria-label={extraType === "date" ? "Date du jalon" : "Rôle"}
        className={cn(
          META_INPUT,
          extraType === "date" ? "w-[8.5rem] font-mono" : "w-24 flex-1",
        )}
      />
      {pending ? (
        <Spinner size={12} className="mr-1 text-ink-4" />
      ) : (
        <button onClick={onDelete} aria-label="Supprimer" className={DEL_BTN}>
          <Trash2 size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}
