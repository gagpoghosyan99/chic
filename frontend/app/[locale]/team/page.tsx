import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";
import AboutPageHero from "../../components/about/AboutPageHero";
import TeamSection from "../../components/home/TeamSection";

export default function TeamPage() {
  const t = useTranslations("team");
  const tNav = useTranslations("nav");
  return (
    <SectionWrapper id="team" className="bg-background">
      <AboutPageHero eyebrow={tNav("about")} title={t("title")} lead={t("lead")} />
      <TeamSection />
    </SectionWrapper>
  );
}
