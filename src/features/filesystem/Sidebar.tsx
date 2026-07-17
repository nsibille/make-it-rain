"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderPlus,
  Lock,
  Menu,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";
import { PROJECT_STATUS } from "@/features/projects/status";
import type { Folder, Project } from "@/features/filesystem/data";
import {
  createFolder,
  createProject,
  deleteFolder,
} from "@/app/(app)/actions";
import { SignOutButton } from "@/features/auth/SignOutButton";

export function Sidebar({
  folders,
  projects,
  userEmail,
}: {
  folders: Folder[];
  projects: Project[];
  userEmail: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<null | "folder" | "project">(null);

  const rootFolders = useMemo(
    () => folders.filter((f) => !f.parent_id),
    [folders],
  );
  const rootProjects = useMemo(
    () => projects.filter((p) => !p.folder_id),
    [projects],
  );

  return (
    <>
      {/* Barre mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
        className="fixed left-3 top-3 z-30 rounded-node border border-border bg-surface p-2 text-ink shadow-1 lg:hidden"
      >
        <Menu size={16} aria-hidden />
      </button>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          role="presentation"
        />
      )}

      <aside
        data-slug={SLUGS.sidebar}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <div>
            <p className="label-mono text-nano">Cadrage Studio</p>
            <p className="text-body font-semibold text-ink">Mes projets</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            className="rounded-node p-1 text-ink-3 hover:bg-surface-2 lg:hidden"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Actions de création */}
        <div className="flex gap-2 px-3 py-3">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => setModal("folder")}
          >
            <FolderPlus size={14} aria-hidden />
            Dossier
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => setModal("project")}
          >
            <Plus size={14} aria-hidden />
            Projet
          </Button>
        </div>

        {/* Arborescence */}
        <nav
          data-slug={SLUGS.folderTree}
          className="flex-1 overflow-y-auto px-2 pb-4"
        >
          {folders.length === 0 && projects.length === 0 ? (
            <p className="px-2 py-6 text-caption text-ink-3">
              Rien encore. Créez un dossier ou un projet pour démarrer.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {rootFolders.map((folder) => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  folders={folders}
                  projects={projects}
                  depth={0}
                />
              ))}
              {rootProjects.map((project) => (
                <li key={project.id}>
                  <ProjectRow project={project} depth={0} />
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Pied : compte */}
        <div className="border-t border-border-soft px-4 py-3">
          {userEmail && (
            <p className="mb-2 truncate font-mono text-nano text-ink-3">
              {userEmail}
            </p>
          )}
          <SignOutButton />
        </div>
      </aside>

      <CreateFolderModal
        open={modal === "folder"}
        onClose={() => setModal(null)}
        folders={folders}
      />
      <CreateProjectModal
        open={modal === "project"}
        onClose={() => setModal(null)}
        folders={folders}
      />
    </>
  );
}

function FolderNode({
  folder,
  folders,
  projects,
  depth,
}: {
  folder: Folder;
  folders: Folder[];
  projects: Project[];
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const children = folders.filter((f) => f.parent_id === folder.id);
  const folderProjects = projects.filter((p) => p.folder_id === folder.id);
  const isEmpty = children.length === 0 && folderProjects.length === 0;

  function handleDelete() {
    if (
      !confirm(
        `Supprimer le dossier « ${folder.name} » ? Les projets qu'il contient seront aussi supprimés.`,
      )
    )
      return;
    const fd = new FormData();
    fd.set("folderId", folder.id);
    startTransition(() => deleteFolder(fd));
  }

  return (
    <li>
      <div
        className="group flex items-center gap-1 rounded-node px-1.5 py-1 hover:bg-surface-2"
        style={{ paddingLeft: depth * 12 + 6 }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Replier" : "Déplier"}
          className="text-ink-3 hover:text-ink"
        >
          {open ? (
            <ChevronDown size={14} aria-hidden />
          ) : (
            <ChevronRight size={14} aria-hidden />
          )}
        </button>
        <FolderIcon size={14} className="text-ink-3" aria-hidden />
        <span className="flex-1 truncate text-body text-ink">
          {folder.name}
        </span>
        {folder.is_system ? (
          <Lock size={12} className="text-ink-4" aria-hidden />
        ) : (
          <button
            onClick={handleDelete}
            disabled={pending}
            aria-label="Supprimer le dossier"
            className="text-ink-4 opacity-0 hover:text-danger group-hover:opacity-100"
          >
            <Trash2 size={13} aria-hidden />
          </button>
        )}
      </div>

      {open && !isEmpty && (
        <ul className="space-y-0.5">
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              folders={folders}
              projects={projects}
              depth={depth + 1}
            />
          ))}
          {folderProjects.map((project) => (
            <li key={project.id}>
              <ProjectRow project={project} depth={depth + 1} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ProjectRow({
  project,
  depth,
}: {
  project: Project;
  depth: number;
}) {
  const status = PROJECT_STATUS[project.status];
  return (
    <Link
      href={`/p/${project.id}`}
      data-slug={SLUGS.projectCard}
      className="flex items-center gap-2 rounded-node px-1.5 py-1 hover:bg-surface-2"
      style={{ paddingLeft: depth * 12 + 24 }}
    >
      <span aria-hidden className="text-body leading-none">
        {project.emoji ?? "📁"}
      </span>
      <span className="flex-1 truncate text-body text-ink">{project.name}</span>
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", status.dot)}
        title={status.label}
      />
    </Link>
  );
}

function CreateFolderModal({
  open,
  onClose,
  folders,
}: {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createFolder(fd);
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau dossier">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldText name="name" label="Nom" placeholder="Ex. Lancements 2026" />
        <FieldFolderSelect
          name="parentId"
          folders={folders.filter((f) => !f.is_system)}
          label="Dossier parent (optionnel)"
        />
        <ModalActions pending={pending} onClose={onClose} submitLabel="Créer" />
      </form>
    </Modal>
  );
}

function CreateProjectModal({
  open,
  onClose,
  folders,
}: {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createProject(fd);
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau projet">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="w-20">
            <FieldText name="emoji" label="Emoji" placeholder="🍕" />
          </div>
          <div className="flex-1">
            <FieldText
              name="name"
              label="Nom du projet"
              placeholder="Ex. Ouvrir une pizzeria"
            />
          </div>
        </div>
        <FieldFolderSelect
          name="folderId"
          folders={folders.filter((f) => !f.is_system)}
          label="Dossier (optionnel)"
        />
        <ModalActions pending={pending} onClose={onClose} submitLabel="Créer" />
      </form>
    </Modal>
  );
}

function FieldText({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label-mono text-nano">{label}</span>
      <input
        name={name}
        autoComplete="off"
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-node border border-border bg-surface px-3 py-2 text-body text-ink outline-none focus:border-border-strong focus:bg-surface-2"
      />
    </label>
  );
}

function FieldFolderSelect({
  name,
  folders,
  label,
}: {
  name: "folderId" | "parentId";
  folders: Folder[];
  label: string;
}) {
  return (
    <label className="block">
      <span className="label-mono text-nano">{label}</span>
      <select
        name={name}
        defaultValue=""
        className="mt-1.5 w-full rounded-node border border-border bg-surface px-3 py-2 text-body text-ink outline-none focus:border-border-strong"
      >
        <option value="">— Racine —</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModalActions({
  pending,
  onClose,
  submitLabel,
}: {
  pending: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <Button type="button" variant="ghost" onClick={onClose}>
        Annuler
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? "…" : submitLabel}
      </Button>
    </div>
  );
}
