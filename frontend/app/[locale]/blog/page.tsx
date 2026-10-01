"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { fetchBlogs, toAbsoluteStrapiUrl, richTextToPlainText, type BlogPost } from "@/lib/strapi";
import SectionWrapper from "../../components/layout/SectionWrapper";

export default function BlogPage() {
  const tNav = useTranslations("nav");
  const locale = useLocale() as "hy" | "ru" | "en";

  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchBlogs(locale);
        if (isMounted) {
          setPosts(data);
        }
      } catch (e) {
        if (isMounted) setPosts([]);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  // Format published date based on locale
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const localeMap: Record<string, string> = {
      hy: "hy-AM",
      ru: "ru-RU",
      en: "en-US",
    };
    const dateLocale = localeMap[locale] || "en-US";
    return new Intl.DateTimeFormat(dateLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <SectionWrapper className="bg-background-light pt-8 md:pt-12 pb-16 md:pb-24">
      <div className="container-content">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-12">
          {tNav("announcements")}
        </h1>

        {isLoading && (
          <div className="text-center text-text-secondary py-12">
            Loading...
          </div>
        )}

        {!isLoading && posts && posts.length === 0 && (
          <div className="text-center text-text-secondary py-12">
            No blog posts available.
          </div>
        )}

        {!isLoading && posts && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const coverImageUrl =
                post.cover_image?.formats?.medium?.url ||
                post.cover_image?.formats?.large?.url ||
                post.cover_image?.formats?.small?.url ||
                post.cover_image?.url;
              const coverImageSrc = toAbsoluteStrapiUrl(coverImageUrl);
              const previewText = richTextToPlainText(post.content, 150);
              const publishedDate = post.publishedAt ? formatDate(post.publishedAt) : "";

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.documentId}`}
                  className="group block rounded-lg border border-border hover:border-primary/30 hover:shadow-card transition-all bg-background overflow-hidden"
                >
                  {coverImageSrc && (
                    <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                      <Image
                        src={coverImageSrc}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {publishedDate && (
                      <div className="text-xs text-text-secondary mb-3">
                        {publishedDate}
                      </div>
                    )}
                    {previewText && (
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                        {previewText}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}


