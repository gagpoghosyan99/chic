type AboutPageHeroProps = {
  title: string;
  lead?: string | null;
  eyebrow?: string;
};

/** Soft atmospheric header for About Us pages (history, team, lecturers, volunteers). */
export default function AboutPageHero({ title, lead, eyebrow }: AboutPageHeroProps) {
  return (
    <header className="about-hero relative mb-12 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-primary-dark via-primary to-primary-light px-6 py-12 text-white shadow-[0_24px_60px_-28px_rgba(0,63,92,0.65)] sm:px-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(255,255,255,0.28), transparent 42%), radial-gradient(circle at 88% 78%, rgba(255,193,7,0.22), transparent 38%), linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.08) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full border border-white/10"
      />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 sm:text-sm">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
        {lead && <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">{lead}</p>}
      </div>
    </header>
  );
}
