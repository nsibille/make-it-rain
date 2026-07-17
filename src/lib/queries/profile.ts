import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

export type Profile = Tables<"profiles">;

/**
 * Profil de l'utilisateur connecté, côté client (TanStack Query).
 * Lecture soumise à la RLS : seul le profil de auth.uid() (+ même org) est lisible.
 */
export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
