/** Scaffold placeholder — a valid, on-brand empty state for routes built later. */
export function PageStub({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note: string;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center px-6 py-24">
      <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
        {eyebrow}
      </p>
      <h1 className="mt-5 text-h1 font-serif text-text-hi">{title}</h1>
      <p className="measure mt-6 text-body text-text-mid">{note}</p>
    </main>
  );
}
