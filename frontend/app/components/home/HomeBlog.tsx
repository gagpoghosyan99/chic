"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { fetchBlogs, richTextToPlainText, toAbsoluteStrapiUrl, type BlogPost } from "@/lib/strapi";
import CardScroller from "./CardScroller";

export default function HomeBlog() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale() as "hy" | "ru" | "en";
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchBlogs(locale);
        if (isMounted) setPosts(data.slice(0, 3));
      } catch {
        if (isMounted) setPosts([]);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const localeMap: Record<string, string> = { hy: "hy-AM", ru: "ru-RU", en: "en-US" };
    return new Intl.DateTimeFormat(localeMap[locale] || "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <section className="bg-white" aria-label={tNav("announcements")}>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-text-primary md:text-4xl">
          {tNav("announcements")}
        </h2>

        {posts === null && (
          <p className="py-8 text-center text-text-secondary">{t("loading")}</p>
        )}

        {posts && posts.length > 0 && (
          <CardScroller label={tNav("announcements")}>
            {posts.map((post) => {
              const coverImageUrl =
                post.cover_image?.formats?.medium?.url ||
                post.cover_image?.formats?.large?.url ||
                post.cover_image?.formats?.small?.url ||
                post.cover_image?.url;
              const coverImageSrc = toAbsoluteStrapiUrl(coverImageUrl);
              const previewText = richTextToPlainText(post.content, 150);
              const publishedDate = formatDate(post.publishedAt);

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.documentId}`}
                  className="depth-card group block h-full overflow-hidden rounded-2xl border border-white/70 bg-white"
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
                    <h3 className="mb-2 text-xl font-semibold text-text-primary transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    {publishedDate && <p className="mb-3 text-xs text-text-secondary">{publishedDate}</p>}
                    {previewText && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">{previewText}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </CardScroller>
        )}

        <div className="mt-10 text-center">
          <Link href={`/${locale}/blog`} className="btn-primary inline-flex">
            {t("seeMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}
