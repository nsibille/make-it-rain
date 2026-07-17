/** Placeholder de vue non encore construite (remplacé aux jalons M4–M5). */
export function ComingSoon({
  title,
  milestone,
  description,
}: {
  title: string;
  milestone: string;
  description: string;
}) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-10">
      <p className="label-mono text-nano">{milestone}</p>
      <h2 className="mt-2 text-title text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-body text-ink-2">{description}</p>
    </main>
  );
}
