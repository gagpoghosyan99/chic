"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  fetchCourseByDocumentId,
  submitCourseRegistration,
  toAbsoluteStrapiUrl,
  type Course,
} from "@/lib/strapi";
import SectionWrapper from "../../../components/layout/SectionWrapper";

interface CourseDetailClientProps {
  initialCourse: Course | null;
  documentId: string;
  locale: "hy" | "ru" | "en";
}

export default function CourseDetailClient({
  initialCourse,
  documentId,
  locale,
}: CourseDetailClientProps) {
  const t = useTranslations("courses");
  const tCommon = useTranslations("common");
  const [course, setCourse] = useState<Course | null>(initialCourse);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCourse);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [registrationData, setRegistrationData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!documentId || initialCourse) return;

    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCourseByDocumentId(documentId, locale);
        if (isMounted) {
          if (data) {
            setCourse(data);
          } else {
            setError("Course not found");
          }
        }
      } catch {
        if (isMounted) {
          setError("Failed to load course");
          setCourse(null);
        }
      }
      if (isMounted) setIsLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [documentId, locale, initialCourse]);

  const coverImageUrl =
    course?.cover_image?.formats?.large?.url ||
    course?.cover_image?.formats?.medium?.url ||
    course?.cover_image?.formats?.small?.url ||
    course?.cover_image?.url;
  const coverImageSrc = toAbsoluteStrapiUrl(coverImageUrl);

  return (
    <SectionWrapper className="bg-background-light pt-8 md:pt-12 pb-16 md:pb-24">
      <div className="container-content">
        <div className="mb-4">
          <Link
            href={`/${locale}/courses`}
            className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
          >
            ← {tCommon("back")}
          </Link>
        </div>

        {isLoading && (
          <div className="text-center text-text-secondary py-12">Loading...</div>
        )}

        {error && (
          <div className="text-center text-text-secondary py-12">{error}</div>
        )}

        {!isLoading && course && (
          <article className="max-w-4xl mx-auto">
            {coverImageSrc && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={coverImageSrc}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {course.title}
            </h1>

            <div className="mb-6">
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  course.is_available
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {course.is_available ? t("available") : t("unavailable")}
              </span>
            </div>

            <div className="text-text-secondary leading-relaxed whitespace-pre-line mb-8">
              {course.description}
            </div>

            {course.is_available && !showRegistrationForm && (
              <button
                onClick={() => setShowRegistrationForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm"
              >
                {t("register")}
              </button>
            )}

            {showRegistrationForm && course.is_available && (
              <div className="mt-8 border border-border rounded-lg p-6 bg-background">
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  {t("registrationForm")}
                </h2>
                <p className="text-sm text-text-secondary mb-4">{course.title}</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    try {
                      const result = await submitCourseRegistration({
                        course: course.title,
                        full_name: registrationData.full_name,
                        email: registrationData.email,
                        phone: registrationData.phone,
                      });

                      if (result.success) {
                        setShowRegistrationForm(false);
                        setShowSuccessPopup(true);
                        setRegistrationData({ full_name: "", email: "", phone: "" });
                      } else {
                        alert("Registration failed. Please try again.");
                      }
                    } catch {
                      alert("Registration failed. Please try again.");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="full_name"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      {t("fullName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      required
                      value={registrationData.full_name}
                      onChange={(e) =>
                        setRegistrationData({
                          ...registrationData,
                          full_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder={t("fullNamePlaceholder") || "John Doe"}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      {t("phone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={registrationData.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^[\d\s+\-()]+$/.test(value)) {
                          setRegistrationData({
                            ...registrationData,
                            phone: value,
                          });
                        }
                      }}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="+1234567890"
                      pattern="[\d\s+\-()]{8,}"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={registrationData.email}
                      onChange={(e) =>
                        setRegistrationData({
                          ...registrationData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegistrationForm(false);
                        setRegistrationData({ full_name: "", email: "", phone: "" });
                      }}
                      className="flex-1 px-4 py-2 border-2 border-border rounded-lg font-medium hover:bg-background transition-colors text-sm"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "..." : t("submit")}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </article>
        )}

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-background-light rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {t("successTitle")}
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                {t("successMessage")}
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm"
              >
                {t("close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
