// Page témoin M0 — vérifie que les tokens du design system répondent.
// Server Component (aucune interactivité). Aucune couleur codée en dur : tokens only.

const STRUCTURES = [
  { slug: "PBS", label: "Produit", accent: "text-pbs", rail: "border-l-pbs", soft: "bg-pbs-soft", softText: "text-pbs-text", code: "PZ-01" },
  { slug: "WBS", label: "Travail", accent: "text-wbs", rail: "border-l-wbs", soft: "bg-wbs-soft", softText: "text-wbs-text", code: "1.0" },
  { slug: "OBS", label: "Organisation", accent: "text-obs", rail: "border-l-obs", soft: "bg-obs-soft", softText: "text-obs-text", code: "—" },
] as const;

const RACI = [
  { k: "R", soft: "bg-raci-r-soft", text: "text-raci-r-text" },
  { k: "A", soft: "bg-raci-a-soft", text: "text-raci-a-text" },
  { k: "C", soft: "bg-raci-c-soft", text: "text-raci-c-text" },
  { k: "I", soft: "bg-raci-i-soft", text: "text-raci-i-text" },
] as const;

export default function Home() {
  return (
    <main className="min-h-full bg-surface text-ink px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="label-mono text-nano">Cadrage Studio · M0</p>
        <h1 className="mt-2 text-display font-sans">Design system branché</h1>
        <p className="mt-3 max-w-xl text-body text-ink-2">
          Page témoin : les tokens{" "}
          <code className="font-mono text-caption text-ink">tokens.css</code> répondent via
          Tailwind v4. Chaque sens porte sa teinte oklch stable.
        </p>

        {/* Teintes par vue */}
        <section className="mt-10">
          <h2 className="label-mono text-nano mb-3">Teintes · PBS / WBS / OBS</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {STRUCTURES.map((s) => (
              <article
                key={s.slug}
                className={`rounded-node border border-border ${s.rail} border-l-[3px] bg-surface shadow-1 p-4`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-nano ${s.accent}`}>
                    {s.slug} · {s.code}
                  </span>
                  <span className={`rounded-chip ${s.soft} ${s.softText} px-1.5 py-0.5 font-mono text-nano`}>
                    {s.label}
                  </span>
                </div>
                <p className="mt-2 text-body font-semibold text-ink">Nœud témoin</p>
                <p className="text-caption text-ink-3">filet gauche 3px à la teinte</p>
              </article>
            ))}
          </div>
        </section>

        {/* Racine N1 pleine encre + nœud « + Ajouter » */}
        <section className="mt-8 flex flex-wrap items-center gap-3">
          <div className="rounded-node bg-ink text-surface shadow-1 px-4 py-3">
            <span className="font-mono text-nano opacity-70">WBS · N1</span>
            <p className="text-body font-semibold">Racine pleine encre</p>
          </div>
          <button className="rounded-node border border-dashed border-border-strong bg-surface-2 text-ink-3 px-4 py-3 text-body">
            + Ajouter
          </button>
          <span className="rounded-node bg-brand text-surface px-4 py-2 text-body">
            Action primaire
          </span>
        </section>

        {/* RACI */}
        <section className="mt-8">
          <h2 className="label-mono text-nano mb-3">RACI</h2>
          <div className="flex gap-2">
            {RACI.map((c) => (
              <span
                key={c.k}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-chip ${c.soft} ${c.text} font-mono text-caption`}
              >
                {c.k}
              </span>
            ))}
          </div>
        </section>

        {/* Contrôle typographique */}
        <section className="mt-8 border-t border-border-soft pt-6">
          <p className="text-title font-sans">Titre · 24/600</p>
          <p className="text-section">Section · 16/600</p>
          <p className="text-body text-ink-2">Corps · 13/400 — dense, voix active.</p>
          <p className="font-mono text-caption text-ink-3">font-mono · JetBrains Mono</p>
        </section>
      </div>
    </main>
  );
}
