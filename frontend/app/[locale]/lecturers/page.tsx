import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";
import LecturersSection from "../../components/home/LecturersSection";

export default function LecturersPage() {
  const t = useTranslations("lecturers");
  return (
    <SectionWrapper id="lecturers" className="bg-background-light">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t("title")}
        </h1>
      </div>
      <LecturersSection />
    </SectionWrapper>
  );
}


