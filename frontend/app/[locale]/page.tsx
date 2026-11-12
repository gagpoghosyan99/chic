"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Hero from "../components/home/Hero";
import HomeBlog from "../components/home/HomeBlog";
import HomeCourses from "../components/home/HomeCourses";
import HomeTours from "../components/home/HomeTours";
import PartnerMarquee from "../components/home/PartnerMarquee";
import SectionWrapper from "../components/layout/SectionWrapper";
import HistorySection from "../components/home/HistorySection";
import TeamSection from "../components/home/TeamSection";
import LecturersSection from "../components/home/LecturersSection";
import CoursesSection from "../components/home/CoursesSection";
import VolunteersSection from "../components/home/VolunteersSection";
import VolunteerForm from "../components/home/VolunteerForm";
import PartnersSection from "../components/home/PartnersSection";
import { fetchHistory, type History } from "@/lib/strapi";

export default function Home() {
  const tHistory = useTranslations("history");
  const tTeam = useTranslations("team");
  const tLecturers = useTranslations("lecturers");
  const tCourses = useTranslations("courses");
  const tVolunteers = useTranslations("volunteers");
  const tVolunteer = useTranslations("volunteer");
  const tPartners = useTranslations("partners");
  const locale = useLocale() as "hy" | "ru" | "en";
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [history, setHistory] = useState<History | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchHistory(locale);
        if (isMounted) {
          setHistory(data);
        }
      } catch (e) {
        if (isMounted) setHistory(null);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setActiveSection(hash);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      } else {
        setActiveSection(null);
      }
    };

    // Check if we're on the home page (no hash or just locale path)
    const isHomePath = pathname === `/${locale}` || pathname === `/${locale}/`;
    if (isHomePath && !window.location.hash) {
      setActiveSection(null);
      // Scroll to top when navigating to home
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleHashChange();
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, [pathname, locale]);

  // Show hero if no section is active
  if (!activeSection) {
    return (
      <>
        <Hero />
        <HomeBlog />
        <HomeCourses />
        <HomeTours />
        <PartnerMarquee />
      </>
    );
  }

  // Show individual sections when hash is present
  return (
    <>
      {activeSection === "history" && (
        <SectionWrapper id="history" className="bg-background">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">{tHistory("title")}</h2>
            {(history?.about || tHistory("lead")) && (
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-text-secondary">
                {history?.about || tHistory("lead")}
              </p>
            )}
          </div>
          <HistorySection />
        </SectionWrapper>
      )}

      {activeSection === "team" && (
        <SectionWrapper id="team" className="bg-background">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">{tTeam("title")}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-text-secondary">{tTeam("lead")}</p>
          </div>
          <TeamSection />
        </SectionWrapper>
      )}

      {activeSection === "lecturers" && (
        <SectionWrapper id="lecturers" className="bg-background">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl">{tLecturers("title")}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-text-secondary">{tLecturers("lead")}</p>
          </div>
          <LecturersSection />
        </SectionWrapper>
      )}

      {activeSection === "courses" && (
        <>
          <SectionWrapper id="courses">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {tCourses("title")}
              </h2>
            </div>
            <CoursesSection />
          </SectionWrapper>
          <SectionWrapper id="volunteers" className="bg-background-light">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-text-primary md:text-4xl">{tVolunteers("title")}</h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-text-secondary">{tVolunteers("lead")}</p>
            </div>
            <VolunteersSection />
          </SectionWrapper>
        </>
      )}

      {activeSection === "volunteer" && (
        <SectionWrapper id="volunteer" className="bg-background-light">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tVolunteer("title")}
            </h2>
          </div>
          <VolunteerForm />
        </SectionWrapper>
      )}

      {activeSection === "partners" && (
        <SectionWrapper id="partners">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tPartners("title")}
            </h2>
          </div>
          <PartnersSection />
        </SectionWrapper>
      )}
    </>
  );
}
