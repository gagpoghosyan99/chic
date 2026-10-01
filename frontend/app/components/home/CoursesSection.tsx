"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { fetchCourses, toAbsoluteStrapiUrl, type Course } from "@/lib/strapi";

export default function CoursesSection() {
  const t = useTranslations("courses");
  const locale = useLocale() as "hy" | "ru" | "en";
  const [activeGallery, setActiveGallery] = useState<string | null>("senior");
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchCourses(locale);
        if (isMounted) {
          setCourses(data);
        }
      } catch {
        if (isMounted) setCourses([]);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  const getCoursesByType = (type: string): Course[] => {
    if (!courses) return [];
    const typeMap: Record<string, string> = {
      senior: "Senior Healthcare Workers",
      mid: "Mid-level Healthcare Workers",
      // eun: "Electronic Educational Material", // Disabled
    };
    return courses.filter((course) => course.type === typeMap[type]);
  };

  const currentCourses = activeGallery ? getCoursesByType(activeGallery) : [];

  return (
    <div>
      <div className="flex gap-3 mb-8 border-b border-border">
        <button
          onClick={() => setActiveGallery("senior")}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeGallery === "senior"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-primary"
          }`}
        >
          {t("senior")}
        </button>
        <button
          onClick={() => setActiveGallery("mid")}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeGallery === "mid"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-primary"
          }`}
        >
          {t("mid")}
        </button>
      </div>

      {isLoading && (
        <div className="col-span-full text-center text-text-secondary py-8">
          Loading...
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentCourses.length > 0 ? (
            currentCourses.map((course) => {
              const coverImageUrl =
                course.cover_image?.formats?.medium?.url ||
                course.cover_image?.formats?.large?.url ||
                course.cover_image?.formats?.small?.url ||
                course.cover_image?.url;
              const coverImageSrc = toAbsoluteStrapiUrl(coverImageUrl);

              return (
                <Link
                  key={course.id}
                  href={`/${locale}/courses/${course.documentId}`}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer block"
                >
                  {coverImageSrc && (
                    <Image
                      src={coverImageSrc}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        course.is_available
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {course.is_available ? t("available") : t("unavailable")}
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center text-text-secondary py-8">
              No courses available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
