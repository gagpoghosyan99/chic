"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import CardScroller from "./CardScroller";

const cards = ["card1", "card2", "card3"] as const;

export default function HomeTours() {
  const t = useTranslations("home");
  const tTours = useTranslations("tours");
  const locale = useLocale();

  return (
    <section className="bg-white" aria-label={tTours("title")}>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-text-primary md:text-4xl">
          {tTours("title")}
        </h2>
        <CardScroller label={tTours("title")}>
          {cards.map((key, index) => (
            <Link
              key={key}
              href={`/${locale}/tours#${key}`}
              className="depth-card group flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white"
            >
              <div
                className="relative flex h-48 items-end overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light p-6 text-white"
                style={{ backgroundPosition: `${index * 40}% center` }}
              >
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold">
                  {t("offers.newDirection")}
                </span>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-text-primary group-hover:text-primary">
                  {tTours(`${key}Title`)}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                  {tTours(`${key}Text`)}
                </p>
              </div>
            </Link>
          ))}
        </CardScroller>
        <div className="mt-10 text-center">
          <Link href={`/${locale}/tours`} className="btn-primary inline-flex">
            {t("seeMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}
