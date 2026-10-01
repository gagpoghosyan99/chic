"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  // No hash-based navigation anymore

  const navItems = [
    {
      label: t("about"),
      id: "about",
      links: [
        { href: `/${locale}/history`, label: t("history") },
        { href: `/${locale}/team`, label: t("team") },
        { href: `/${locale}/lecturers`, label: t("lecturers") },
        { href: `/${locale}/volunteers`, label: t("volunteers") },
      ],
    },
    {
      label: t("activity"),
      id: "activity",
      links: [
        { href: `/${locale}/courses`, label: t("courses") },
        { href: `/${locale}/consulting`, label: t("qualityConsulting") },
        { href: `/${locale}/licensing`, label: t("licensingConsulting") },
        { href: `/${locale}/construction`, label: t("construction") },
        // { href: `/${locale}/programs`, label: t("programs") }, // Disabled
      ],
    },
    // Blog as a direct link (no dropdown)
    {
      label: t("announcements"),
      id: "announcements",
      href: `/${locale}/blog`
    },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-content">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Organization Name */}
          <Link
            href={`/${locale}`}
            onClick={(e) => {
              // Clear hash when going to home
              if (window.location.hash) {
                e.preventDefault();
                window.location.href = `/${locale}`;
              }
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/collab-white.png"
              alt="CHIC Logo"
              width={64}
              height={64}
              className="object-contain"
            />
            <span className="font-bold text-lg text-primary hidden sm:block max-w-xs">
              {tCommon("orgName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                {/* If item has a direct href, render it as a link (no dropdown) */}
                {"href" in item && item.href ? (
                  <Link
                    href={item.href as string}
                    className="px-4 py-2 text-text-primary font-medium hover:text-primary transition-colors rounded-lg hover:bg-primary-lighter"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 text-text-primary font-medium hover:text-primary transition-colors rounded-lg hover:bg-primary-lighter"
                      onMouseEnter={() => toggleDropdown(item.id)}
                      onMouseLeave={closeDropdowns}
                      onClick={() => toggleDropdown(item.id)}
                    >
                      {item.label}
                    </button>
                    {activeDropdown === item.id && (
                      <div
                        className="absolute top-full left-0 bg-white rounded-lg shadow-lg border border-border min-w-[220px] py-2"
                        onMouseEnter={() => setActiveDropdown(item.id)}
                        onMouseLeave={closeDropdowns}
                      >
                        {item.links?.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            className="block px-4 py-2 text-text-secondary hover:text-primary hover:bg-primary-lighter transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Language Switcher and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <button
              className="lg:hidden p-2 text-text-primary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2 mb-4">
              {navItems.map((item) => (
                <div key={item.id} className="border-b border-border pb-2">
                  {"href" in item && item.href ? (
                    <Link
                      href={item.href as string}
                      className="font-semibold text-text-primary"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <div className="font-semibold text-text-primary mb-2">
                        {item.label}
                      </div>
                      <div className="flex flex-col gap-1 pl-4">
                        {item.links?.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.href}
                            className="text-text-secondary hover:text-primary transition-colors py-1"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {!isHomePage && (
                <Link
                  href={`/${locale}`}
                  onClick={(e) => {
                    // Clear hash when going to home
                    if (window.location.hash) {
                      e.preventDefault();
                      window.location.href = `/${locale}`;
                    }
                  }}
                  className="font-semibold text-text-primary py-2"
                >
                  {tCommon("home")}
                </Link>
              )}
            </div>
            <div className="pt-4 border-t border-border">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
