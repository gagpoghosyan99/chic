"use client";

import { useEffect, useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overCover, setOverCover] = useState(false);

  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const apply = () => {
      document.documentElement.style.setProperty("--site-header", `${header.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      const cover = document.querySelector("[data-cover]");
      const headerHeight = document.querySelector("header")?.offsetHeight ?? 96;
      setOverCover(!!cover && cover.getBoundingClientRect().bottom > headerHeight + 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

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
        { href: `/${locale}/tours`, label: t("tours") },
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

  const lightOnCover = scrolled && overCover && !mobileMenuOpen;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
        lightOnCover ? "bg-transparent text-white shadow-none" : "bg-white text-text-primary shadow-sm"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-16">
        <div className="flex items-center justify-between min-h-24 py-4">
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
            className="group flex items-center gap-3"
          >
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-colors sm:h-16 sm:w-16 ${lightOnCover ? "bg-white/15 ring-1 ring-white/40" : "bg-primary-lighter/70 ring-1 ring-primary/10"}`}>
              <Image
                src="/collab-white.png"
                alt="CHIC Logo"
                width={52}
                height={52}
                className="object-contain"
              />
            </span>
            <span className={`hidden max-w-[14rem] text-base font-bold leading-tight tracking-tight sm:block md:max-w-xs md:text-lg ${lightOnCover ? "text-white" : "text-primary"}`}>
              {tCommon("orgName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.id} className="nav-pop relative">
                {"href" in item && item.href ? (
                  <Link
                    href={item.href as string}
                    className={`site-nav-link px-4 py-2 font-medium tracking-wide ${lightOnCover ? "text-white" : "text-text-primary"}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`site-nav-link px-4 py-2 font-medium tracking-wide ${lightOnCover ? "text-white" : "text-text-primary"}`}
                    >
                      {item.label}
                    </button>
                    <div className="nav-pop-panel absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-3">
                      <div className="nav-pop-card rounded-2xl border border-white/80 bg-white/90 p-3 shadow-card-hover backdrop-blur-md">
                        {item.links?.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="nav-pop-link mb-1 block rounded-xl px-4 py-3 text-sm font-medium text-text-primary last:mb-0"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
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
              className={`lg:hidden p-2 transition-colors ${lightOnCover ? "text-white" : "text-text-primary"}`}
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
          <div className="border-t border-border bg-white py-4 text-text-primary lg:hidden">
            <div className="flex flex-col gap-2 mb-4">
              {navItems.map((item) => (
                <div key={item.id} className="border-b border-border pb-2">
                  {"href" in item && item.href ? (
                    <Link
                      href={item.href as string}
                      className="font-semibold text-text-primary"
                      onClick={() => setMobileMenuOpen(false)}
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
                            onClick={() => setMobileMenuOpen(false)}
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
