import { getTranslations, getLocale } from "next-intl/server";
import SectionWrapper from "../../components/layout/SectionWrapper";
import AboutPageHero from "../../components/about/AboutPageHero";
import HistorySection from "../../components/home/HistorySection";
import { fetchHistory } from "@/lib/strapi";

export default async function HistoryPage() {
  const t = await getTranslations("history");
  const tNav = await getTranslations("nav");
  const locale = (await getLocale()) as "hy" | "ru" | "en";
  const history = await fetchHistory(locale);

  return (
    <SectionWrapper id="history" className="bg-background">
      <AboutPageHero
        eyebrow={tNav("about")}
        title={t("title")}
        lead={history?.about || t("lead")}
      />
      <HistorySection />
    </SectionWrapper>
  );
}
