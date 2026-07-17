"use client";

import { useState } from "react";
import { Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { SLUGS } from "@/lib/slugs";
import { useAnnotations } from "./AnnotationsProvider";

/** Volet latéral des annotations d'un nœud, en temps réel. */
export function AnnotationDrawer() {
  const {
    openNodeId,
    thread,
    loading,
    canAnnotate,
    currentUserId,
    close,
    addComment,
    deleteComment,
  } = useAnnotations();
  const [draft, setDraft] = useState("");

  if (!openNodeId) return null;

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await addComment(text);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <div
        className="animate-fade-in absolute inset-0 bg-ink/20"
        onClick={close}
        role="presentation"
      />
      <aside
        data-slug={SLUGS.annotationDrawer}
        className="animate-slide-in-right relative z-10 flex h-full w-full max-w-sm flex-col border-l border-border bg-surface shadow-2"
        role="dialog"
        aria-label="Annotations du nœud"
      >
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <div>
            <p className="label-mono text-nano">Annotations</p>
            <p className="text-body font-semibold text-ink">Fil du nœud</p>
          </div>
          <button
            onClick={close}
            aria-label="Fermer"
            className="rounded-node p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {loading && thread.length === 0 && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-node border border-border bg-surface-2 p-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton variant="text" w={90} />
                    <Skeleton variant="text" w={60} />
                  </div>
                  <Skeleton variant="text" className="mt-2 w-full" />
                  <Skeleton variant="text" className="mt-1.5 w-2/3" />
                </div>
              ))}
            </div>
          )}
          {!loading && thread.length === 0 && (
            <p className="text-body text-ink-3">
              Aucun commentaire. {canAnnotate ? "Ouvrez le fil." : ""}
            </p>
          )}
          {thread.map((a) => (
            <div
              key={a.id}
              className="group animate-fade-in-up rounded-node border border-border bg-surface-2 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-nano text-ink-3">
                  {a.author_email ?? a.author_id.slice(0, 8)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-nano text-ink-4">
                    {a.created_at
                      ? new Date(a.created_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                  {a.author_id === currentUserId && (
                    <button
                      onClick={() => deleteComment(a.id)}
                      aria-label="Supprimer le commentaire"
                      className="text-ink-4 opacity-0 hover:text-danger group-hover:opacity-100"
                    >
                      <Trash2 size={12} aria-hidden />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-body text-ink">
                {a.body}
              </p>
            </div>
          ))}
        </div>

        {canAnnotate ? (
          <div className="border-t border-border-soft p-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              className="resize-none"
              placeholder="Ajouter un commentaire…"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-nano text-ink-4">⌘+↵</span>
              <Button size="sm" onClick={send}>
                <Send size={13} aria-hidden />
                Envoyer
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-border-soft px-4 py-3">
            <p className="text-caption text-ink-3">
              Lecture seule — vous ne pouvez pas commenter.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
