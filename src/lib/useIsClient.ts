import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * `true` côté client (après hydratation), `false` au rendu serveur.
 * Sert à n'ouvrir un portail (`createPortal`) qu'une fois monté, sans
 * `setState` dans un effet (règle react-hooks/set-state-in-effect).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
