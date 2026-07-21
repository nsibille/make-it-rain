"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { SLUGS } from "@/lib/slugs";
import { LinkPending, RouteProgress } from "@/components/ui/RouteProgress";
import { PROJECT_VIEWS } from "./views";

/** Onglets de navigation entre les vues d'un projet (URL deep-linkables). */
export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav
      data-slug={SLUGS.tabs}
      className="flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-6"
    >
      {PROJECT_VIEWS.map((view) => {
        const href = `/p/${projectId}/${view.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={view.slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-body transition-colors",
              active
                ? "border-ink font-medium text-ink"
                : "border-transparent text-ink-3 hover:text-ink",
            )}
          >
            {view.label}
            <LinkPending />
            <RouteProgress />
          </Link>
        );
      })}
    </nav>
  );
}
