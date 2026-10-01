"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function Hero() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  return (
    <section
      className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light"
      style={{
        backgroundImage: "url('/backgrphoto.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary-dark/70"></div>

      {/* Content */}
      <div className="relative z-10 container-content text-center text-white py-20">
        {/* <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {t("welcome")}
        </h1> */}
        <p className="text-2xl md:text-3xl lg:text-4xl mb-8 text-white/90 max-w-2xl mx-auto" >
          {t("thanksMessage")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/courses`}
            className="font-semibold px-6 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-primary text-white hover:bg-primary-dark"
          >
            {tNav("courses")}
          </Link>
          <Link
            href={`/${locale}#volunteer`}
            className="btn-secondary bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            {tNav("becomeVolunteer")}
          </Link>
        </div>
      </div>
    </section>
  );
}

