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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
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
      await supabase.from("annotations").insert({
        project_id: projectId,
        node_id: openNodeId,
        author_id: currentUserId,
        body: text,
      });
      // le Realtime mettra à jour le compteur ; on rafraîchit le fil tout de suite
      await loadThread(openNodeId);
    },
    [supabase, projectId, openNodeId, currentUserId, loadThread],
  );

  const deleteComment = useCallback(
    async (id: string) => {
      await supabase.from("annotations").delete().eq("id", id);
      if (openNodeId) await loadThread(openNodeId);
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
