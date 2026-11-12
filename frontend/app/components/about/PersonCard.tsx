import Image from "next/image";
import type { ReactNode } from "react";

type PersonCardProps = {
  name: string;
  role?: string | null;
  imageSrc?: string | null;
  index?: number;
};

/** Portrait / profile card with layered depth, used on team & volunteers pages. */
export function PersonCard({ name, role, imageSrc, index = 0 }: PersonCardProps) {
  return (
    <article
      className="person-card depth-card group flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary-lighter to-primary/20">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-bold text-primary/30">
            {name.trim().charAt(0) || "?"}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-dark/55 to-transparent" />
      </div>
      <div className="relative z-10 -mt-8 mx-3 mb-3 rounded-xl border border-white/80 bg-white/95 p-4 shadow-[0_12px_28px_-18px_rgba(0,63,92,0.55)] backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
        {role && <p className="mt-1 text-sm leading-relaxed text-text-secondary">{role}</p>}
      </div>
    </article>
  );
}

type LecturerCardProps = {
  name: string;
  role?: string | null;
  index?: number;
};

/** Text-forward card for lecturers (no photos in CMS). */
export function LecturerCard({ name, role, index = 0 }: LecturerCardProps) {
  return (
    <article
      className="person-card depth-card relative overflow-hidden rounded-2xl border border-white/70 bg-white p-6"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-accent/40 to-primary/20"
      />
      <div className="relative flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/30">
          {name.trim().charAt(0) || "?"}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
          {role && <p className="mt-2 text-sm leading-relaxed text-text-secondary">{role}</p>}
        </div>
      </div>
    </article>
  );
}

type CtaCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

/** Fourth “slot” card — Become a volunteer. */
export function VolunteerCtaCard({ href, title, subtitle }: CtaCardProps) {
  return (
    <a
      href={href}
      className="person-card depth-card group relative flex h-full min-h-[22rem] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/35 bg-gradient-to-br from-primary-lighter via-white to-accent/20 p-6 text-center transition-colors hover:border-primary hover:bg-primary-lighter"
    >
      <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-primary text-3xl font-light text-white shadow-[0_16px_30px_-12px_rgba(0,84,119,0.7)] transition-transform duration-300 group-hover:scale-110">
        +
      </span>
      <span className="text-xl font-bold text-primary">{title}</span>
      {subtitle && <span className="mt-2 max-w-[16rem] text-sm text-text-secondary">{subtitle}</span>}
    </a>
  );
}
