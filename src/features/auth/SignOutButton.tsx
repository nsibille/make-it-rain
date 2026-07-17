"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-node border border-border-strong bg-surface px-3 py-1.5 text-body text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
    >
      <LogOut size={14} aria-hidden />
      Se déconnecter
    </button>
  );
}
