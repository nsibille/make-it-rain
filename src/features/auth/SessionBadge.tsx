"use client";

import { useProfile } from "@/lib/queries/profile";
import { SLUGS } from "@/lib/slugs";

/**
 * Preuve du chemin client : lit le profil via TanStack Query + client
 * navigateur (RLS). Démontre que providers + hooks + session cookie
 * fonctionnent côté Client Component.
 */
export function SessionBadge() {
  const { data: profile, isLoading, isError } = useProfile();

  return (
    <div
      data-slug={SLUGS.statusBadge}
      className="rounded-node border border-border bg-surface-2 p-4"
    >
      <p className="label-mono text-nano">Session (client · TanStack Query)</p>
      {isLoading && (
        <p className="mt-1 text-body text-ink-3">Chargement du profil…</p>
      )}
      {isError && (
        <p className="mt-1 text-body text-danger">Profil illisible (RLS ?).</p>
      )}
      {profile && (
        <p className="mt-1 text-body text-ink">
          Connecté :{" "}
          <span className="font-mono text-caption text-ink">
            {profile.email ?? profile.id}
          </span>
        </p>
      )}
    </div>
  );
}
