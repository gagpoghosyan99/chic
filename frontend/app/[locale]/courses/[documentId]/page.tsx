import { Metadata } from "next";
import { headers } from "next/headers";
import { fetchCourseByDocumentId, toAbsoluteStrapiUrl } from "@/lib/strapi";
import CourseDetailClient from "./CourseDetailClient";

type Props = {
  params: {
    locale: string;
    documentId: string;
  };
};

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  try {
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // Headers might not be available in all contexts
  }

  return "https://chic.ngo";
}

function truncateDescription(text: string, maxLength = 200): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trim()}...`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documentId, locale } = params;
  const localeTyped = locale as "hy" | "ru" | "en";

  try {
    const course = await fetchCourseByDocumentId(documentId, localeTyped);

    if (!course) {
      return {
        title: "Course Not Found",
        description: "The requested course could not be found.",
      };
    }

    const coverImageUrl =
      course.cover_image?.formats?.large?.url ||
      course.cover_image?.formats?.medium?.url ||
      course.cover_image?.formats?.small?.url ||
      course.cover_image?.url;
    const coverImageSrc = toAbsoluteStrapiUrl(coverImageUrl);
    const description =
      truncateDescription(course.description) ||
      "Training course from CHIC - Center for Joint Healthcare Innovations NGO";
    const siteUrl = getSiteUrl();
    const courseUrl = `${siteUrl}/${locale}/courses/${documentId}`;

    return {
      title: course.title,
      description,
      openGraph: {
        title: course.title,
        description,
        type: "article",
        url: courseUrl,
        images: coverImageSrc
          ? [
              {
                url: coverImageSrc,
                width: 1200,
                height: 630,
                alt: course.title,
              },
            ]
          : [],
        siteName: "CHIC - Center for Joint Healthcare Innovations NGO",
      },
      twitter: {
        card: "summary_large_image",
        title: course.title,
        description,
        images: coverImageSrc ? [coverImageSrc] : [],
      },
    };
  } catch {
    return {
      title: "Course",
      description: "Training course from CHIC - Center for Joint Healthcare Innovations NGO",
    };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { documentId, locale } = params;
  const localeTyped = locale as "hy" | "ru" | "en";
  const course = await fetchCourseByDocumentId(documentId, localeTyped);

  return (
    <CourseDetailClient
      initialCourse={course}
      documentId={documentId}
      locale={localeTyped}
    />
  );
}
