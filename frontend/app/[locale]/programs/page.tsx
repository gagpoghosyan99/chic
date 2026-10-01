import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";

export default function ProgramsPage() {
  const t = useTranslations("nav");
  return (
    <SectionWrapper id="programs">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t("programs")}
        </h1>
      </div>
      <div className="text-text-secondary text-center">
        {/* Placeholder content for Programs */}
      </div>
    </SectionWrapper>
  );
}


