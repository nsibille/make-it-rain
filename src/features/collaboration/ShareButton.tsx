"use client";

import { useState, useTransition } from "react";
import { Share2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FieldLabel, Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
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
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    const invited = email;
    startTransition(async () => {
      const res = await inviteMember(projectId, invited, role);
      if (res.ok) {
        setEmail("");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
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
              <FieldLabel>Email de l’invité</FieldLabel>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@entreprise.fr"
              />
            </label>

            <label className="block">
              <FieldLabel>Rôle</FieldLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as InviteRole)}
              >
                <option value="annotator">Annotateur — lit et commente</option>
                <option value="observer">Observateur — lecture seule</option>
              </Select>
            </label>

            <div className="flex justify-end">
              <Button type="submit" loading={pending}>
                {!pending && <UserPlus size={14} aria-hidden />}
                Inviter
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
  const toast = useToast();
  const label = member.email || member.user_id;

  return (
    <li className="flex items-center gap-2">
      <span className="flex-1 truncate font-mono text-caption text-ink">
        {label}
      </span>
      {member.role === "pmo" ? (
        <span className="label-mono text-nano">{ROLE_LABEL.pmo}</span>
      ) : (
        <select
          value={member.role}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as InviteRole;
            startTransition(async () => {
              await changeMemberRole(projectId, member.user_id, next);
              toast.success(`Rôle mis à jour — ${ROLE_LABEL[next]}`);
            });
          }}
          className="rounded-node border border-border bg-surface px-2 py-1 text-caption text-ink outline-none focus:border-border-strong"
        >
          <option value="annotator">Annotateur</option>
          <option value="observer">Observateur</option>
        </select>
      )}
      {member.role !== "pmo" && (
        <button
          onClick={() =>
            startTransition(async () => {
              await removeMember(projectId, member.user_id);
              toast.success(`${label} retiré du projet`);
            })
          }
          disabled={pending}
          aria-label="Retirer le membre"
          className="rounded-node p-1 text-ink-4 transition-all duration-[var(--duration-instant)] ease-[var(--ease)] hover:bg-surface-2 hover:text-danger active:scale-90 disabled:opacity-55"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      )}
    </li>
  );
}
