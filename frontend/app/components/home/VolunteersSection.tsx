"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchOurVolunteers, toAbsoluteStrapiUrl, type OurVolunteerItem } from "@/lib/strapi";
import { PersonCard, VolunteerCtaCard } from "../about/PersonCard";

export default function VolunteersSection({ showCta = true }: { showCta?: boolean }) {
  const locale = useLocale() as "hy" | "ru" | "en";
  const t = useTranslations("volunteers");
  const tVolunteer = useTranslations("volunteer");
  const tCommon = useTranslations("common");
  const [volunteers, setVolunteers] = useState<OurVolunteerItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchOurVolunteers(locale);
        if (isMounted) setVolunteers(data);
      } catch {
        if (isMounted) setVolunteers([]);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  if (isLoading) {
    return (
      <div className="depth-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-primary-lighter" />
        ))}
      </div>
    );
  }

  return (
    <div className="depth-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {(volunteers ?? []).map((volunteer, index) => {
        const rawImage =
          volunteer.image_url?.formats?.medium?.url ||
          volunteer.image_url?.formats?.small?.url ||
          volunteer.image_url?.formats?.thumbnail?.url ||
          volunteer.image_url?.url;
        return (
          <PersonCard
            key={volunteer.id}
            name={volunteer.full_name}
            imageSrc={toAbsoluteStrapiUrl(rawImage)}
            index={index}
          />
        );
      })}
      {!isLoading && (!volunteers || volunteers.length === 0) && (
        <p className="col-span-full py-4 text-center text-text-secondary">{tCommon("error")}</p>
      )}
      {showCta && (
        <VolunteerCtaCard
          href={`/${locale}/volunteers#become-volunteer`}
          title={tVolunteer("title")}
          subtitle={t("ctaLead")}
        />
      )}
    </div>
  );
}
