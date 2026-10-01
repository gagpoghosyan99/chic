"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }
    
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    
    // Special handling for blog pages: always redirect to /blog/{locale}
    if (pathWithoutLocale.startsWith("/blog")) {
      const hash = window.location.hash;
      const newPath = `/${newLocale}/blog${hash}`;
      window.location.href = newPath;
      return;
    }
    
    // Preserve hash if present
    const hash = window.location.hash;
    // Build new path
    const newPath = `/${newLocale}${pathWithoutLocale}${hash}`;
    
    // Use window.location for reliable navigation
    window.location.href = newPath;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const languageNames: Record<Locale, string> = {
    hy: "Հայ",
    ru: "Рус",
    en: "Eng",
  };

  const currentLanguage = languageNames[locale];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg shadow-card hover:shadow-card-hover transition-all font-medium"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span>{currentLanguage}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-border min-w-[120px] py-2 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === loc
                  ? "bg-primary-lighter text-primary font-medium"
                  : "text-text-secondary hover:bg-primary-lighter hover:text-primary"
              }`}
            >
              {languageNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
