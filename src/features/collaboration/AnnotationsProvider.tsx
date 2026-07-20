"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Annotation, AnnotationCounts } from "./types";

interface AnnotationsContextValue {
  counts: AnnotationCounts;
  canAnnotate: boolean;
  openNodeId: string | null;
  thread: Annotation[];
  loading: boolean;
  currentUserId: string | null;
  open: (nodeId: string) => void;
  close: () => void;
  addComment: (body: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
}

const noop = () => {};
const AnnotationsContext = createContext<AnnotationsContextValue>({
  counts: {},
  canAnnotate: false,
  openNodeId: null,
  thread: [],
  loading: false,
  currentUserId: null,
  open: noop,
  close: noop,
  addComment: async () => {},
  deleteComment: async () => {},
});

export const useAnnotations = () => useContext(AnnotationsContext);

export function AnnotationsProvider({
  projectId,
  canAnnotate,
  initialCounts,
  children,
}: {
  projectId: string;
  canAnnotate: boolean;
  initialCounts: AnnotationCounts;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [counts, setCounts] = useState<AnnotationCounts>(initialCounts);
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);
  const [thread, setThread] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
      setCurrentUserEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  const loadThread = useCallback(
    async (nodeId: string) => {
      setLoading(true);
      const { data } = await supabase
        .from("annotations")
        .select("id, node_id, author_id, body, created_at, profiles(email)")
        .eq("node_id", nodeId)
        .order("created_at", { ascending: true });
      setThread(
        (data ?? []).map((a) => {
          const prof = a.profiles as unknown as { email: string | null } | null;
          return {
            id: a.id,
            node_id: a.node_id,
            author_id: a.author_id,
            body: a.body,
            created_at: a.created_at,
            author_email: prof?.email ?? null,
          };
        }),
      );
      setLoading(false);
    },
    [supabase],
  );

  // Realtime : maintient les compteurs et le fil ouvert à jour.
  useEffect(() => {
    const channel = supabase
      .channel(`annotations-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "annotations",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as {
            node_id: string;
          } | null;
          if (!row) return;

          if (payload.eventType === "INSERT") {
            setCounts((c) => ({
              ...c,
              [row.node_id]: (c[row.node_id] ?? 0) + 1,
            }));
          } else if (payload.eventType === "DELETE") {
            setCounts((c) => ({
              ...c,
              [row.node_id]: Math.max(0, (c[row.node_id] ?? 0) - 1),
            }));
          }

          // rafraîchit le fil si le nœud concerné est ouvert
          setOpenNodeId((current) => {
            if (current && current === row.node_id) loadThread(current);
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, projectId, loadThread]);

  const open = useCallback(
    (nodeId: string) => {
      setOpenNodeId(nodeId);
      loadThread(nodeId);
    },
    [loadThread],
  );

  const close = useCallback(() => {
    setOpenNodeId(null);
    setThread([]);
  }, []);

  const addComment = useCallback(
    async (body: string) => {
      const text = body.trim();
      if (!text || !openNodeId || !currentUserId) return;

      // Optimiste : le commentaire apparaît immédiatement dans le fil, sans
      // attendre l'API. Le Realtime rechargera le fil (réconciliation de l'id)
      // et incrémentera le compteur ; on n'incrémente donc pas ici (anti double).
      const tempId = `temp-${crypto.randomUUID()}`;
      const nodeId = openNodeId;
      setThread((prev) => [
        ...prev,
        {
          id: tempId,
          node_id: nodeId,
          author_id: currentUserId,
          body: text,
          created_at: new Date().toISOString(),
          author_email: currentUserEmail,
        },
      ]);

      const { error } = await supabase.from("annotations").insert({
        project_id: projectId,
        node_id: nodeId,
        author_id: currentUserId,
        body: text,
      });

      // On part du principe que l'appel passe ; en cas d'échec réel, on retire
      // l'optimiste pour ne pas laisser un fantôme.
      if (error) {
        setThread((prev) => prev.filter((a) => a.id !== tempId));
      }
    },
    [supabase, projectId, openNodeId, currentUserId, currentUserEmail],
  );

  const deleteComment = useCallback(
    async (id: string) => {
      // Optimiste : retrait immédiat ; le Realtime décrémentera le compteur.
      const nodeId = openNodeId;
      setThread((prev) => prev.filter((a) => a.id !== id));
      const { error } = await supabase.from("annotations").delete().eq("id", id);
      if (error && nodeId) await loadThread(nodeId); // rollback si refus
    },
    [supabase, openNodeId, loadThread],
  );

  const value: AnnotationsContextValue = {
    counts,
    canAnnotate,
    openNodeId,
    thread,
    loading,
    currentUserId,
    open,
    close,
    addComment,
    deleteComment,
  };

  return (
    <AnnotationsContext.Provider value={value}>
      {children}
    </AnnotationsContext.Provider>
  );
}
