import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PROJECT_STATUS } from "@/features/projects/status";

/**
 * Stub de vue projet (M2). Charge le projet via RLS et affiche l'en-tête.
 * Les onglets 6-Pack / PBS / WBS / OBS / Gouvernance arrivent en M3–M5 et
 * remplaceront cette page par un layout à onglets.
 */
export default async function ProjectStubPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) notFound();

  const status = PROJECT_STATUS[project.status];
  const VIEWS = ["6-Pack", "PBS", "WBS", "OBS", "Gouvernance"];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 pt-14 sm:px-10 lg:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-caption text-ink-3 hover:text-ink"
      >
        <ArrowLeft size={13} aria-hidden />
        Tous les projets
      </Link>

      <header className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-display leading-none">
            {project.emoji ?? "📁"}
          </span>
          <h1 className="text-title text-ink">{project.name}</h1>
        </div>
        <StatusBadge label={status.label} dotClassName={status.dot} />
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <span
            key={v}
            className="rounded-node border border-dashed border-border-strong bg-surface-2 px-3 py-1.5 text-caption text-ink-3"
          >
            {v}
          </span>
        ))}
      </div>
      <p className="mt-4 text-body text-ink-2">
        Vues à venir (M3–M5). Le 6-Pack, les arbres PBS / WBS / OBS et la
        gouvernance ont déjà été initialisés en base à la création du projet.
      </p>
    </main>
  );
}
