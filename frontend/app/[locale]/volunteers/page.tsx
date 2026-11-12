import { useTranslations } from "next-intl";
import SectionWrapper from "../../components/layout/SectionWrapper";
import AboutPageHero from "../../components/about/AboutPageHero";
import VolunteersSection from "../../components/home/VolunteersSection";
import VolunteerForm from "../../components/home/VolunteerForm";

export default function VolunteersPage() {
  const t = useTranslations("volunteers");
  const tVolunteer = useTranslations("volunteer");
  const tNav = useTranslations("nav");

  return (
    <>
      <SectionWrapper id="volunteers" className="bg-background">
        <AboutPageHero eyebrow={tNav("about")} title={t("title")} lead={t("lead")} />
        <VolunteersSection />
      </SectionWrapper>

      <SectionWrapper id="become-volunteer" className="bg-background-light">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
            {tNav("about")}
          </p>
          <h2 className="text-3xl font-bold text-text-primary md:text-4xl">{tVolunteer("title")}</h2>
          <p className="mt-4 text-text-secondary">{t("ctaLead")}</p>
        </div>
        <VolunteerForm />
      </SectionWrapper>
    </>
  );
}
