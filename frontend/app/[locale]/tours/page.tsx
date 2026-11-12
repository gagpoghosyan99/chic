import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import SectionWrapper from "../../components/layout/SectionWrapper";

const cards = ["card1", "card2", "card3"] as const;

export default function ToursPage() {
  const t = useTranslations("tours");
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <SectionWrapper>
      <div className="mb-12 text-center">
        <p className="mb-3 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white">
          {tHome("offers.newDirection")}
        </p>
        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">{t("title")}</h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-text-secondary">{t("lead")}</p>
      </div>
      <div className="depth-grid grid gap-6 md:grid-cols-3">
        {cards.map((key) => (
          <article id={key} key={key} className="depth-card rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-3 text-xl font-semibold text-text-primary">{t(`${key}Title`)}</h2>
            <p className="leading-relaxed text-text-secondary">{t(`${key}Text`)}</p>
          </article>
        ))}
      </div>
      <div className="mt-12 text-center">
        <a href="mailto:chic.ngo.arm@gmail.com" className="btn-primary inline-flex">
          {tCommon("email")}
        </a>
        <div className="mt-4">
          <Link href={`/${locale}`} className="text-primary hover:underline">
            {tCommon("home")}
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
