import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";
import AboutPageHero from "../../components/about/AboutPageHero";
import LecturersSection from "../../components/home/LecturersSection";

export default function LecturersPage() {
  const t = useTranslations("lecturers");
  const tNav = useTranslations("nav");
  return (
    <SectionWrapper id="lecturers" className="bg-background">
      <AboutPageHero eyebrow={tNav("about")} title={t("title")} lead={t("lead")} />
      <LecturersSection />
    </SectionWrapper>
  );
}
