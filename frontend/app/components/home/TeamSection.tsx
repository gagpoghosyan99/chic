"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchOurTeam, toAbsoluteStrapiUrl, type OurTeamItem } from "@/lib/strapi";
import { PersonCard } from "../about/PersonCard";

export default function TeamSection() {
  const locale = useLocale() as "hy" | "ru" | "en";
  const t = useTranslations("common");
  const [team, setTeam] = useState<OurTeamItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchOurTeam(locale);
        if (isMounted) setTeam(data);
      } catch {
        if (isMounted) setTeam([]);
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

  if (!team?.length) {
    return <p className="py-8 text-center text-text-secondary">{t("loading")}</p>;
  }

  return (
    <div className="depth-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {team.map((member, index) => {
        const rawImage =
          member.image_url?.formats?.medium?.url ||
          member.image_url?.formats?.small?.url ||
          member.image_url?.formats?.thumbnail?.url ||
          member.image_url?.url;
        return (
          <PersonCard
            key={member.id}
            name={member.full_name}
            role={member.profession}
            imageSrc={toAbsoluteStrapiUrl(rawImage)}
            index={index}
          />
        );
      })}
    </div>
  );
}
