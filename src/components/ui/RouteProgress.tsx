"use client";

import { useEffect, useState } from "react";
import { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/ui/Spinner";
import { useIsClient } from "@/lib/useIsClient";
import { SLUGS } from "@/lib/slugs";

/**
 * Barre de progression de navigation — comble le délai entre le clic sur un
 * `<Link>` et l'apparition du contenu (chargement du segment RSC), pendant que
 * les squelettes se préparent. Indéterminée, discrète, en haut de la fenêtre.
 *
 * S'appuie sur `useLinkStatus` : n'est actif que sous le `<Link>` cliqué, donc
 * une seule barre à la fois. Un léger délai évite le clignotement sur les
 * navigations quasi instantanées — l'animation ne s'affiche que si l'attente
 * est réellement perceptible.
 *
 * À monter comme enfant direct d'un `<Link>`.
 */
export function RouteProgress({ delay = 120 }: { delay?: number }) {
  const { pending } = useLinkStatus();
  const isClient = useIsClient();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setVisible(true), delay);
    // Cleanup : au retour de pending → false (navigation finie) ou au démontage.
    return () => {
      clearTimeout(t);
      setVisible(false);
    };
  }, [pending, delay]);

  if (!isClient || !visible) return null;

  return createPortal(
    <div className="route-bar-track" data-slug={SLUGS.routeProgress} aria-hidden>
      <div className="route-bar-fill" />
    </div>,
    document.body,
  );
}

/**
 * Indicateur inline « en cours » pour un lien de navigation (onglet, ligne de
 * projet). Petit spinner qui apparaît sur l'élément cliqué le temps du
 * chargement — repère local complémentaire de la barre globale.
 *
 * À monter comme enfant direct d'un `<Link>`.
 */
export function LinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner size={11} className={className} />;
}
