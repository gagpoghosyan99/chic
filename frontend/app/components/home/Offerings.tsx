"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

function IconEducation() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5v4.2c0 .8 2.2 2.3 5 2.3s5-1.5 5-2.3v-4.2" />
    </svg>
  );
}

function IconQuality() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

function IconLicensing() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 14.5 2 2 4-4.5" />
    </svg>
  );
}

function IconInfrastructure() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20.5h16M6 20.5V10l6-4.5 6 4.5v10.5" />
      <path strokeLinecap="round" d="M10 20.5v-5h4v5" />
    </svg>
  );
}

function IconTour() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.8 12.2 21 7.4l-5.2 9.6-2.4-3.3-3.6 3.1.4-3.8-7.4-.8Z" />
    </svg>
  );
}

const items = [
  { key: "education", href: "courses", Icon: IconEducation },
  { key: "quality", href: "consulting", Icon: IconQuality },
  { key: "licensing", href: "licensing", Icon: IconLicensing },
  { key: "infrastructure", href: "construction", Icon: IconInfrastructure },
  { key: "medTour", href: "tours", Icon: IconTour },
] as const;

export default function Offerings() {
  const t = useTranslations("home.offers");
  const locale = useLocale();

  return (
    <ul className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:gap-3" aria-label={t("label")}>
      {items.map((item) => {
        const Icon = item.Icon;
        const row = (
          <>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-primary">
              <Icon />
            </span>
            <span className="min-w-0 text-sm font-medium leading-snug text-white sm:text-base xl:whitespace-nowrap">
              {t(item.key)}
            </span>
            {item.key === "medTour" && (
              <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                {t("newDirection")}
              </span>
            )}
          </>
        );
        const className = "flex flex-wrap items-center gap-x-3 gap-y-1";

        return (
          <li key={item.key}>
            {item.href ? (
              <Link href={`/${locale}/${item.href}`} className={`${className} hover:text-white/80`}>
                {row}
              </Link>
            ) : (
              <div className={className}>{row}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
