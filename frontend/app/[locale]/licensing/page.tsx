"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import SectionWrapper from "../../components/layout/SectionWrapper";
import { fetchLicensingConsultings, QualityManagementSystemConsultingItem } from "../../../lib/strapi";

export default function LicensingPage() {
  const t = useTranslations("licensing");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [licensingItems, setLicensingItems] = useState<QualityManagementSystemConsultingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const items = await fetchLicensingConsultings(locale as "hy" | "ru" | "en");
        setLicensingItems(items);
      } catch (error) {
        console.error("Failed to load licensing items:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [locale]);

  const toggleSubSection = (id: string) => {
    setActiveSubSection(activeSubSection === id ? null : id);
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Group items by type
  const groupedItems = useMemo(() => {
    const groups: Record<string, QualityManagementSystemConsultingItem[]> = {};
    licensingItems.forEach((item) => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item);
    });
    return groups;
  }, [licensingItems]);

  // Map type to section configuration
  const typeToSection = {
    "Medical Institutions": {
      id: "hospital",
      label: t("hospitals"),
      text: t("hospitalsText"),
    },
    "Pharmacies": {
      id: "pharmacy",
      label: t("pharmacies"),
      text: t("pharmaciesText"),
    },
    "Dental Centers": {
      id: "dental",
      label: t("dental"),
      text: t("dentalText"),
    },
    "Laboratories": {
      id: "laboratory",
      label: t("laboratories"),
      text: "",
    },
  };

  const sections = useMemo(() => {
    return Object.entries(typeToSection)
      .filter(([type]) => groupedItems[type] && groupedItems[type].length > 0)
      .map(([type, config]) => ({
        ...config,
        type,
        items: groupedItems[type] || [],
      }));
  }, [groupedItems, t]);

  return (
    <SectionWrapper className="bg-background-light">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t("title")}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">{tCommon("loading") || "Loading..."}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => {
              const isLaboratory = section.id === "laboratory";
              const isActive = isLaboratory 
                ? activeDropdown === "labDropdown" 
                : activeSubSection === section.id;

              return (
                <div key={section.id} className="card overflow-hidden">
                  <button
                    onClick={() => isLaboratory ? toggleDropdown("labDropdown") : toggleSubSection(section.id)}
                    className="block w-[calc(100%+3rem)] -mx-6 -mt-6 text-left flex items-center justify-between p-4 mb-4 rounded-t-lg hover:bg-primary-lighter transition-colors"
                  >
                    <span className="text-lg font-semibold text-text-primary">
                      {section.label}
                    </span>
                    <svg
                      className={`w-5 h-5 text-primary transition-transform ${
                        isActive ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isActive && (
                    <div className="space-y-4">
                      {section.items.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                          {section.items.map((item) => {
                            const content = (
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group bg-gradient-to-br from-primary-lighter via-background-light to-primary-lighter/30 border border-primary/20 flex items-center justify-center cursor-pointer hover:border-primary/40 hover:scale-105">
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10 w-full px-3 py-2 flex flex-col items-center justify-center min-h-0">
                                  <p className="text-base font-semibold text-text-primary group-hover:text-primary group-hover:opacity-0 transition-all duration-300 leading-tight text-center break-words w-full">
                                    {item.name}
                                  </p>
                                  {item.blog_url && (
                                    <div className="absolute inset-0 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 px-4">
                                      <div className="flex items-center justify-center gap-1 max-w-full">
                                        <span className="text-xs font-medium text-center break-words">{t("viewDetails")}</span>
                                        <svg
                                          className="w-4 h-4 flex-shrink-0"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );

                            if (item.blog_url) {
                              return (
                                <a
                                  key={item.id}
                                  href={item.blog_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  {content}
                                </a>
                              );
                            }

                            return <div key={item.id}>{content}</div>;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href={`/${locale}`} className="btn-secondary">
            {tCommon("back")}
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
