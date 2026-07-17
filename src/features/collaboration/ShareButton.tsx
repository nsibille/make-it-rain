"use client";

import { useState, useTransition } from "react";
import { Share2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SLUGS } from "@/lib/slugs";
import type { Member } from "./members";
import { changeMemberRole, inviteMember, removeMember } from "./actions";

type InviteRole = "annotator" | "observer";

const ROLE_LABEL: Record<Member["role"], string> = {
  pmo: "PMO",
  annotator: "Annotateur",
  observer: "Observateur",
};

export function ShareButton({
  projectId,
  members,
}: {
  projectId: string;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("annotator");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await inviteMember(projectId, email, role);
      setFeedback(res);
      if (res.ok) setEmail("");
    });
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Share2 size={14} aria-hidden />
        Partager
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Partager le projet"
      >
        <div data-slug={SLUGS.inviteModal}>
          <form onSubmit={submitInvite} className="space-y-3">
            <label className="block">
              <span className="label-mono text-nano">Email de l’invité</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@entreprise.fr"
                className="mt-1.5 w-full rounded-node border border-border bg-surface px-3 py-2 text-body text-ink outline-none focus:border-border-strong focus:bg-surface-2"
              />
            </label>

            <label className="block">
              <span className="label-mono text-nano">Rôle</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as InviteRole)}
                className="mt-1.5 w-full rounded-node border border-border bg-surface px-3 py-2 text-body text-ink outline-none focus:border-border-strong"
              >
                <option value="annotator">Annotateur — lit et commente</option>
                <option value="observer">Observateur — lecture seule</option>
              </select>
            </label>

            {feedback && (
              <p
                className={
                  feedback.ok
                    ? "text-body text-status-done"
                    : "text-body text-danger"
                }
              >
                {feedback.message}
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                <UserPlus size={14} aria-hidden />
                {pending ? "…" : "Inviter"}
              </Button>
            </div>
          </form>

          <div className="mt-5 border-t border-border-soft pt-4">
            <p className="label-mono text-nano mb-2">
              Membres ({members.length})
            </p>
            {members.length === 0 ? (
              <p className="text-body text-ink-3">
                Personne n’est encore invité. Le projet reste privé.
              </p>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <MemberRow key={m.user_id} projectId={projectId} member={m} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

function MemberRow({
  projectId,
  member,
}: {
  projectId: string;
  member: Member;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-2">
      <span className="flex-1 truncate font-mono text-caption text-ink">
        {member.email || member.user_id}
      </span>
      {member.role === "pmo" ? (
        <span className="label-mono text-nano">{ROLE_LABEL.pmo}</span>
      ) : (
        <select
          value={member.role}
          disabled={pending}
          onChange={(e) =>
            startTransition(() =>
              changeMemberRole(
                projectId,
                member.user_id,
                e.target.value as InviteRole,
              ),
            )
          }
          className="rounded-node border border-border bg-surface px-2 py-1 text-caption text-ink outline-none focus:border-border-strong"
        >
          <option value="annotator">Annotateur</option>
          <option value="observer">Observateur</option>
        </select>
      )}
      {member.role !== "pmo" && (
        <button
          onClick={() =>
            startTransition(() => removeMember(projectId, member.user_id))
          }
          disabled={pending}
          aria-label="Retirer le membre"
          className="rounded-node p-1 text-ink-4 hover:bg-surface-2 hover:text-danger"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}
