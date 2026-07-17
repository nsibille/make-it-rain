import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFolders, getProjects } from "@/features/filesystem/data";
import { Sidebar } from "@/features/filesystem/Sidebar";
import { seedExamplesIfEmpty } from "@/features/examples/seed";

/**
 * Shell de l'app authentifiée : sidebar (dossiers + projets) + zone
 * principale. Gate d'accès : sans session → /login. La sécurité réelle
 * reste la RLS ; ce gate est le confort de navigation.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Clone les exemples pizza à la première connexion (idempotent).
  await seedExamplesIfEmpty().catch(() => {});

  const [{ data: profile }, folders, projects] = await Promise.all([
    supabase.from("profiles").select("email").eq("id", user.id).single(),
    getFolders(),
    getProjects(),
  ]);

  return (
    <div className="flex min-h-dvh bg-surface text-ink">
      <Sidebar
        folders={folders}
        projects={projects}
        userEmail={profile?.email ?? user.email ?? null}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
