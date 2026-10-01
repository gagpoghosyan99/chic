import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";
import TeamSection from "../../components/home/TeamSection";

export default function TeamPage() {
  const t = useTranslations("team");
  return (
    <SectionWrapper id="team">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {t("title")}
        </h1>
      </div>
      <TeamSection />
    </SectionWrapper>
  );
}


