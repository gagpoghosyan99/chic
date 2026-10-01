"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { fetchOurTeam, toAbsoluteStrapiUrl, type OurTeamItem } from "@/lib/strapi";

export default function TeamSection() {
  const locale = useLocale() as "hy" | "ru" | "en";

  const [team, setTeam] = useState<OurTeamItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchOurTeam(locale);
        if (isMounted) {
          setTeam(data);
        }
      } catch (e) {
        if (isMounted) setTeam([]);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        {(team ?? []).map((member) => {
          const name = member.full_name;
          const role = member.profession;
          const rawImage =
            member.image_url?.formats?.medium?.url ||
            member.image_url?.formats?.small?.url ||
            member.image_url?.formats?.thumbnail?.url ||
            member.image_url?.url;
          const imageSrc = toAbsoluteStrapiUrl(rawImage);

          return (
            <div
              key={member.id}
              className="p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-card transition-all bg-background-light flex items-center gap-4"
            >
              {imageSrc && (
                <div className="shrink-0">
                  <Image
                    src={imageSrc}
                    alt={name}
                    width={96}
                    height={96}
                    sizes="(max-width: 768px) 64px, 96px"
                    className="w-24 h-24 md:w-24 md:h-24 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="font-semibold text-text-primary">{name}</div>
                {role && (
                  <div className="text-sm text-text-secondary mt-1">{role}</div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="col-span-full text-center text-text-secondary">
            Loading...
          </div>
        )}
        {!isLoading && team && team.length === 0 && (
          <div className="col-span-full text-center text-text-secondary">
            {/* Intentionally minimal empty state */}
          </div>
        )}
      </div>
    </div>
  );
}
