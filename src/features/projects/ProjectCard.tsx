"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SLUGS } from "@/lib/slugs";
import { PROJECT_STATUS } from "@/features/projects/status";
import type { Project } from "@/features/filesystem/data";
import { deleteProject, setProjectStatus } from "@/app/(app)/actions";

export function ProjectCard({ project }: { project: Project }) {
  const [pending, startTransition] = useTransition();
  const status = PROJECT_STATUS[project.status];

  function changeStatus(next: "draft" | "published") {
    const fd = new FormData();
    fd.set("projectId", project.id);
    fd.set("status", next);
    startTransition(() => setProjectStatus(fd));
  }

  function remove() {
    if (!confirm(`Supprimer le projet « ${project.name} » ?`)) return;
    const fd = new FormData();
    fd.set("projectId", project.id);
    startTransition(() => deleteProject(fd));
  }

  return (
    <article
      data-slug={SLUGS.projectCard}
      className="flex flex-col rounded-node border border-border bg-surface p-4 shadow-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="text-title leading-none">
            {project.emoji ?? "📁"}
          </span>
          <h3 className="text-section text-ink">{project.name}</h3>
        </div>
        <StatusBadge label={status.label} dotClassName={status.dot} />
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
          className="inline-flex items-center gap-1.5 rounded-node bg-brand px-3 py-1.5 text-caption font-medium text-surface transition-colors hover:bg-ink-1"
        >
          Ouvrir
          <ArrowRight size={13} aria-hidden />
        </Link>

        {project.status === "draft" ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => changeStatus("published")}
          >
            Publier
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => changeStatus("draft")}
          >
            Repasser en brouillon
          </Button>
        )}

        <button
          onClick={remove}
          disabled={pending}
          aria-label="Supprimer le projet"
          className="ml-auto rounded-node p-1.5 text-ink-4 hover:bg-surface-2 hover:text-danger disabled:opacity-60"
        >
          <Trash2 size={15} aria-hidden />
        </button>
      </div>
    </article>
  );
}
