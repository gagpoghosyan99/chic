"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchOurPartners, type OurPartnerItem } from "@/lib/strapi";

export default function PartnersSection() {
  const locale = useLocale() as "hy" | "ru" | "en";

  const [partners, setPartners] = useState<OurPartnerItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchOurPartners(locale);
        if (isMounted) {
          setPartners(data);
        }
      } catch (e) {
        if (isMounted) setPartners([]);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
        {(partners ?? []).map((partner) => {
          const hasUrl = partner.blog_url && partner.blog_url.trim() !== "";

          const cardContent = (
            <div className="text-text-primary text-sm md:text-base font-medium text-center px-2">
              {partner.name}
            </div>
          );

          const cardClassName = "min-h-[60px] w-auto min-w-[120px] md:min-w-[140px] p-3 rounded-lg border border-border hover:border-primary/30 hover:shadow-card transition-all bg-background-light flex items-center justify-center";

          return hasUrl ? (
            <a
              key={partner.id}
              href={partner.blog_url!}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cardClassName} cursor-pointer`}
            >
              {cardContent}
            </a>
          ) : (
            <div
              key={partner.id}
              className={cardClassName}
            >
              {cardContent}
            </div>
          );
        })}
        {isLoading && (
          <div className="w-full text-center text-text-secondary">
            Loading...
          </div>
        )}
        {!isLoading && partners && partners.length === 0 && (
          <div className="w-full text-center text-text-secondary">
            {/* Intentionally minimal empty state */}
          </div>
        )}
      </div>
    </div>
  );
}

