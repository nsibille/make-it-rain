import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

/** Une instance / réunion de pilotage (PROJECT_SPEC §7). */
export interface Instance {
  name: string;
  animateur: string;
  scribe: string;
  acteurs: string[];
  frequence: string;
  duree: string;
  objectif: string;
  docs_in: string[];
  docs_out: string[];
}

/** Matrice RACI : lots (lignes) × rôles (colonnes), cellules R/A/C/I. */
export interface Raci {
  roles: string[];
  lots: { name: string; v: string[] }[];
}

export interface GovernanceData {
  instances: Instance[];
  raci: Raci;
}

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const asString = (v: unknown): string => (typeof v === "string" ? v : "");

export function normalizeInstance(raw: unknown): Instance {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    name: asString(o.name),
    animateur: asString(o.animateur),
    scribe: asString(o.scribe),
    acteurs: asStringArray(o.acteurs),
    frequence: asString(o.frequence),
    duree: asString(o.duree),
    objectif: asString(o.objectif),
    docs_in: asStringArray(o.docs_in),
    docs_out: asStringArray(o.docs_out),
  };
}

function parseInstances(j: Json | null): Instance[] {
  return Array.isArray(j) ? j.map(normalizeInstance) : [];
}

function parseRaci(j: Json | null): Raci {
  const o = (j ?? {}) as Record<string, unknown>;
  const roles = asStringArray(o.roles);
  const lots = Array.isArray(o.lots)
    ? o.lots.map((l) => {
        const lo = (l ?? {}) as Record<string, unknown>;
        return { name: asString(lo.name), v: asStringArray(lo.v) };
      })
    : [];
  return { roles, lots };
}

export async function getGovernance(
  projectId: string,
): Promise<GovernanceData> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("governance")
    .select("instances, raci")
    .eq("project_id", projectId)
    .maybeSingle();

  return {
    instances: parseInstances(data?.instances ?? null),
    raci: parseRaci(data?.raci ?? null),
  };
}
