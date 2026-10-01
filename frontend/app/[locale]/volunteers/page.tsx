import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";
import VolunteersSection from "../../components/home/VolunteersSection";

export default function VolunteersPage() {
  const t = useTranslations("volunteers");
  return (
    <SectionWrapper id="volunteers">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t("title")}
        </h1>
      </div>
      <VolunteersSection />
    </SectionWrapper>
  );
}

