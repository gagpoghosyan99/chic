import { Metadata } from "next";
import { headers } from "next/headers";
import { fetchBlogByDocumentId, toAbsoluteStrapiUrl, richTextToPlainText, type BlogPost } from "@/lib/strapi";
import BlogPostClient from "./BlogPostClient";

type Props = {
  params: {
    locale: string;
    slug: string;
  };
};

function getSiteUrl(): string {
  // Try to get from environment variable first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Try to get from headers (works in server components)
  try {
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch (e) {
    // Headers might not be available in all contexts
  }
  
  // Fallback to default domain
  return "https://chic.ngo";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = params;
  const localeTyped = locale as "hy" | "ru" | "en";
  
  try {
    const post = await fetchBlogByDocumentId(slug, localeTyped);
    
    if (!post) {
      return {
        title: "Blog Post Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    // Get cover image URL - prefer large format for Open Graph
    const coverImageUrl =
      post.cover_image?.formats?.large?.url ||
      post.cover_image?.formats?.medium?.url ||
      post.cover_image?.formats?.small?.url ||
      post.cover_image?.url;
    const coverImageSrc = toAbsoluteStrapiUrl(coverImageUrl);
    
    const description = richTextToPlainText(post.content, 200);
    
    // Get the site URL for Open Graph
    const siteUrl = getSiteUrl();
    const postUrl = `${siteUrl}/${locale}/blog/${slug}`;

    return {
      title: post.title,
      description: description || "Blog post from CHIC - Center for Joint Healthcare Innovations NGO",
      openGraph: {
        title: post.title,
        description: description || "Blog post from CHIC - Center for Joint Healthcare Innovations NGO",
        type: "article",
        url: postUrl,
        images: coverImageSrc ? [
          {
            url: coverImageSrc,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
        siteName: "CHIC - Center for Joint Healthcare Innovations NGO",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: description || "Blog post from CHIC - Center for Joint Healthcare Innovations NGO",
        images: coverImageSrc ? [coverImageSrc] : [],
      },
    };
  } catch (error) {
    return {
      title: "Blog Post",
      description: "Blog post from CHIC - Center for Joint Healthcare Innovations NGO",
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = params;
  const localeTyped = locale as "hy" | "ru" | "en";
  
  const post = await fetchBlogByDocumentId(slug, localeTyped);

  return <BlogPostClient initialPost={post} slug={slug} locale={localeTyped} />;
}

