import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Shell de l'app authentifiée. Gate d'accès : sans session → /login.
 * La sidebar / navigation seront ajoutées au M2. La sécurité réelle
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

  if (!user) {
    redirect("/login");
  }

  return <div className="min-h-dvh bg-surface text-ink">{children}</div>;
}
