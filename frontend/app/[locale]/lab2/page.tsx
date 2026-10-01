"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import SectionWrapper from "../../components/layout/SectionWrapper";

export default function Lab2Page() {
  const t = useTranslations("lab2");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <SectionWrapper className="bg-background-light">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t("title")}
          </h1>
        </div>

        <div className="space-y-6 mb-12">
          <div className="card">
            <p className="text-text-secondary leading-relaxed">{t("text1")}</p>
          </div>
          <div className="card">
            <p className="text-text-secondary leading-relaxed">{t("text2")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {["lab5", "lab6", "lab7", "lab8"].map((img) => (
            <div
              key={img}
              className="relative aspect-square rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all group"
            >
              <Image
                src={`/${img}.jpeg`}
                alt={`lab ${img.slice(-1)}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href={`/${locale}/consulting`} className="btn-secondary">
            ← {tCommon("back")}
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
