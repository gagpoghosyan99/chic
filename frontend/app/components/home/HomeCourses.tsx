"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { fetchCourses, toAbsoluteStrapiUrl, type Course } from "@/lib/strapi";
import CardScroller from "./CardScroller";

export default function HomeCourses() {
  const t = useTranslations("home");
  const tCourses = useTranslations("courses");
  const locale = useLocale() as "hy" | "ru" | "en";
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchCourses(locale);
        if (isMounted) setCourses(data.slice(0, 3));
      } catch {
        if (isMounted) setCourses([]);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <section className="bg-background" aria-label={tCourses("title")}>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-text-primary md:text-4xl">
          {tCourses("title")}
        </h2>

        {courses === null && (
          <p className="py-8 text-center text-text-secondary">{t("loading")}</p>
        )}

        {courses && courses.length > 0 && (
          <CardScroller label={tCourses("title")}>
            {courses.map((course) => {
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
                  className="depth-card group flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white"
                >
                  {coverImageSrc && (
                    <div className="relative h-48 w-full overflow-hidden bg-primary-lighter">
                      <Image
                        src={coverImageSrc}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary transition-colors group-hover:text-primary">
                      {course.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </CardScroller>
        )}

        <div className="mt-10 text-center">
          <Link href={`/${locale}/courses`} className="btn-primary inline-flex">
            {t("seeMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}
