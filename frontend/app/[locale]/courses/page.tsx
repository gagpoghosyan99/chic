import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";
import CoursesSection from "../../components/home/CoursesSection";

export default function CoursesPage() {
  const t = useTranslations("courses");
  return (
    <SectionWrapper id="courses">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t("title")}
        </h1>
      </div>
      <CoursesSection />
    </SectionWrapper>
  );
}


