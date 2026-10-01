"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchOurLecturers, type OurLecturerItem } from "@/lib/strapi";

export default function LecturersSection() {
  const locale = useLocale() as "hy" | "ru" | "en";

  const [lecturers, setLecturers] = useState<OurLecturerItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchOurLecturers(locale);
        if (isMounted) {
          setLecturers(data);
        }
      } catch (e) {
        if (isMounted) setLecturers([]);
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
        {(lecturers ?? []).map((lecturer) => {
          const name = lecturer.full_name;
          const position = lecturer.profession;

          return (
            <div
              key={lecturer.id}
              className="p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-card transition-all bg-background-light"
            >
              <div className="font-semibold text-text-primary mb-1">
                {name}
              </div>
              <div className="text-sm text-text-secondary leading-relaxed">
                {position}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="col-span-full text-center text-text-secondary">
            Loading...
          </div>
        )}
        {!isLoading && lecturers && lecturers.length === 0 && (
          <div className="col-span-full text-center text-text-secondary">
            {/* Intentionally minimal empty state */}
          </div>
        )}
      </div>
    </div>
  );
}
