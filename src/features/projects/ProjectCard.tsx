"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SLUGS } from "@/lib/slugs";
import { PROJECT_STATUS, type ProjectStatus } from "@/features/projects/status";
import type { Project } from "@/features/filesystem/data";
import { deleteProject, setProjectStatus } from "@/app/(app)/actions";

export function ProjectCard({ project }: { project: Project }) {
  const [pending, startTransition] = useTransition();
  // Statut optimiste : le badge et le bouton basculent immédiatement, sans
  // attendre le retour de l'API (on part du principe que l'appel passe).
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [removed, setRemoved] = useState(false);
  const meta = PROJECT_STATUS[status];

  function changeStatus(next: "draft" | "published") {
    setStatus(next);
    const fd = new FormData();
    fd.set("projectId", project.id);
    fd.set("status", next);
    startTransition(() => setProjectStatus(fd));
  }

  function remove() {
    if (!confirm(`Supprimer le projet « ${project.name} » ?`)) return;
    setRemoved(true); // disparition immédiate
    const fd = new FormData();
    fd.set("projectId", project.id);
    startTransition(() => deleteProject(fd));
  }

  if (removed) return null;

  return (
    <article
      data-slug={SLUGS.projectCard}
      className="animate-fade-in-up flex flex-col rounded-pop border border-border bg-surface p-4 transition-[transform,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="text-[22px] leading-none">
            {project.emoji ?? "📁"}
          </span>
          <h3 className="text-section text-ink">{project.name}</h3>
        </div>
        <StatusBadge tone={meta.tone} label={meta.label} />
      </div>

      <p className="mt-3 font-mono text-nano text-ink-4">
        Modifié le{" "}
        {project.updated_at
          ? new Date(project.updated_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </p>

      <div className="mt-4 flex items-center gap-2 border-t border-border-soft pt-3">
        <Link
          href={`/p/${project.id}`}
          className="inline-flex items-center gap-1.5 rounded-node border border-ink bg-ink px-[13px] py-[6px] text-caption font-medium text-surface transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-ink-1 active:scale-[0.97]"
        >
          Ouvrir
          <ArrowRight size={13} aria-hidden />
        </Link>

        {status === "draft" ? (
          <Button
            size="sm"
            variant="secondary"
            loading={pending}
            onClick={() => changeStatus("published")}
          >
            Publier
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            loading={pending}
            onClick={() => changeStatus("draft")}
          >
            Repasser en brouillon
          </Button>
        )}

        <button
          onClick={remove}
          disabled={pending}
          aria-label="Supprimer le projet"
          className={cn(
            "ml-auto rounded-node p-1.5 text-ink-4 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 hover:text-danger active:scale-90 disabled:opacity-60",
          )}
        >
          <Trash2 size={15} aria-hidden />
        </button>
      </div>
    </article>
  );
}
