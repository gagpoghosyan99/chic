"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchOurLecturers, type OurLecturerItem } from "@/lib/strapi";
import { LecturerCard } from "../about/PersonCard";

export default function LecturersSection() {
  const locale = useLocale() as "hy" | "ru" | "en";
  const t = useTranslations("common");
  const [lecturers, setLecturers] = useState<OurLecturerItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchOurLecturers(locale);
        if (isMounted) setLecturers(data);
      } catch {
        if (isMounted) setLecturers([]);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  if (isLoading) {
    return (
      <div className="depth-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-primary-lighter" />
        ))}
      </div>
    );
  }

  if (!lecturers?.length) {
    return <p className="py-8 text-center text-text-secondary">{t("loading")}</p>;
  }

  return (
    <div className="depth-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {lecturers.map((lecturer, index) => (
        <LecturerCard
          key={lecturer.id}
          name={lecturer.full_name}
          role={lecturer.profession}
          index={index}
        />
      ))}
    </div>
  );
}
