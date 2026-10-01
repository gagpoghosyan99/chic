import { getTranslations, getLocale } from "next-intl/server";
import SectionWrapper from "../../components/layout/SectionWrapper";
import HistorySection from "../../components/home/HistorySection";
import { fetchHistory } from "@/lib/strapi";

export default async function HistoryPage() {
  const t = await getTranslations("history");
  const locale = (await getLocale()) as "hy" | "ru" | "en";
  const history = await fetchHistory(locale);

  return (
    <SectionWrapper id="history" className="bg-background-light">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t("title")}
        </h1>
        {history?.about && (
          <p className="text-text-secondary text-lg w-full leading-relaxed">
            {history.about}
          </p>
        )}
      </div>
      <HistorySection />
    </SectionWrapper>
  );
}


