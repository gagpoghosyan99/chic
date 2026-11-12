"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchOurPartners, toAbsoluteStrapiUrl, type OurPartnerItem } from "@/lib/strapi";

function PartnerChip({ partner }: { partner: OurPartnerItem }) {
  const photo =
    partner.photo_url?.formats?.small?.url ||
    partner.photo_url?.formats?.thumbnail?.url ||
    partner.photo_url?.url;
  const src = toAbsoluteStrapiUrl(photo);
  const body = (
    <>
      {src ? (
        <img src={src} alt="" className="h-12 w-12 rounded-full object-contain bg-white" />
      ) : (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-lighter text-sm font-bold text-primary">
          {partner.name.slice(0, 1)}
        </span>
      )}
      <span className="max-w-[14rem] text-sm font-semibold text-text-primary">{partner.name}</span>
    </>
  );
  const className = "mx-3 flex shrink-0 items-center gap-3 rounded-full border border-border bg-white px-4 py-3 shadow-card";
  if (partner.blog_url) {
    return (
      <a href={partner.blog_url} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    );
  }
  return <div className={className}>{body}</div>;
}

export default function PartnerMarquee() {
  const t = useTranslations("home");
  const locale = useLocale() as "hy" | "ru" | "en";
  const [partners, setPartners] = useState<OurPartnerItem[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchOurPartners(locale)
      .then((data) => {
        if (mounted) setPartners(data);
      })
      .catch(() => {
        if (mounted) setPartners([]);
      });
    return () => {
      mounted = false;
    };
  }, [locale]);

  if (partners.length === 0) return null;

  const loop = [...partners, ...partners];

  return (
    <section className="overflow-hidden border-y border-border bg-background py-8" aria-label={t("partnersLabel")}>
      <div className="partner-track">
        {loop.map((partner, index) => (
          <PartnerChip key={`${partner.id}-${index}`} partner={partner} />
        ))}
      </div>
    </section>
  );
}
