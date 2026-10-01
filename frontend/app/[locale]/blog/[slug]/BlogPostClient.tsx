"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { fetchBlogByDocumentId, toAbsoluteStrapiUrl, richTextToHtml, type BlogPost } from "@/lib/strapi";
import SectionWrapper from "../../../components/layout/SectionWrapper";

interface BlogPostClientProps {
  initialPost: BlogPost | null;
  slug: string;
  locale: "hy" | "ru" | "en";
}

export default function BlogPostClient({ initialPost, slug, locale }: BlogPostClientProps) {
  const tCommon = useTranslations("common");
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [isLoading, setIsLoading] = useState<boolean>(!initialPost);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || initialPost) return;

    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchBlogByDocumentId(slug, locale);
        if (isMounted) {
          if (data) {
            setPost(data);
          } else {
            setError("Post not found");
          }
        }
      } catch (e) {
        if (isMounted) {
          setError("Failed to load post");
          setPost(null);
        }
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [slug, locale, initialPost]);

  const coverImageUrl =
    post?.cover_image?.formats?.large?.url ||
    post?.cover_image?.formats?.medium?.url ||
    post?.cover_image?.formats?.small?.url ||
    post?.cover_image?.url;
  const coverImageSrc = toAbsoluteStrapiUrl(coverImageUrl);
  const htmlContent = post ? richTextToHtml(post.content) : "";

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

  const publishedDate = post?.publishedAt ? formatDate(post.publishedAt) : "";

  return (
    <SectionWrapper className="bg-background-light pt-8 md:pt-12 pb-16 md:pb-24">
      <div className="container-content">
        <div className="mb-4">
          <Link
            href={`/${locale}/blog`}
            className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
          >
            ← {tCommon("back")}
          </Link>
        </div>

        {isLoading && (
          <div className="text-center text-text-secondary py-12">
            Loading...
          </div>
        )}

        {error && (
          <div className="text-center text-text-secondary py-12">
            {error}
          </div>
        )}

        {!isLoading && post && (
          <article className="max-w-4xl mx-auto">
            {coverImageSrc && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={coverImageSrc}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {post.title}
            </h1>

            {publishedDate && (
              <div className="text-sm text-text-secondary mb-6">
                {publishedDate}
              </div>
            )}

            {htmlContent && (
              <div
                className="blog-content text-text-secondary leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </article>
        )}
      </div>
    </SectionWrapper>
  );
}
