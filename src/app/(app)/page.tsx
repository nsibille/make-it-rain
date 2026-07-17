import { FolderOpen } from "lucide-react";
import { getProjects } from "@/features/filesystem/data";
import { ProjectCard } from "@/features/projects/ProjectCard";

/**
 * Dashboard : tous les projets accessibles (RLS), avec pastille de statut
 * et actions de cycle de vie (publier / brouillon / supprimer).
 */
export default async function AppHome() {
  const projects = await getProjects();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 pt-14 sm:px-10 lg:pt-10">
      <header className="mb-8">
        <p className="label-mono text-nano">Cadrage Studio</p>
        <h1 className="mt-2 text-title text-ink">Vos projets</h1>
        <p className="mt-1 text-body text-ink-2">
          Du 6-Pack aux arborescences PBS / WBS / OBS et à la gouvernance.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-node border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center">
          <FolderOpen
            className="mx-auto text-ink-4"
            size={28}
            aria-hidden
          />
          <p className="mt-3 text-section text-ink">Aucun projet pour l’instant.</p>
          <p className="mt-1 text-body text-ink-2">
            Créez votre premier projet depuis la barre latérale — le 6-Pack et
            les arbres se mettent en place tout seuls.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  );
}
