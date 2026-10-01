"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Hero from "../components/home/Hero";
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
        <SectionWrapper id="history" className="bg-background-light">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tHistory("title")}
            </h2>
            {history?.about && (
              <p className="text-text-secondary text-lg w-full leading-relaxed">
                {history.about}
              </p>
            )}
          </div>
          <HistorySection />
        </SectionWrapper>
        <SectionWrapper id="team">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tTeam("title")}
            </h2>
          </div>
          <TeamSection />
        </SectionWrapper>
        <SectionWrapper id="lecturers" className="bg-background-light">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tLecturers("title")}
            </h2>
          </div>
          <LecturersSection />
        </SectionWrapper>
        <SectionWrapper id="courses">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tCourses("title")}
            </h2>
          </div>
          <CoursesSection />
        </SectionWrapper>
        <SectionWrapper id="volunteers" className="bg-background-light">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tVolunteers("title")}
            </h2>
          </div>
          <VolunteersSection />
        </SectionWrapper>
        <SectionWrapper id="volunteer" className="bg-background-light">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tVolunteer("title")}
            </h2>
          </div>
          <VolunteerForm />
        </SectionWrapper>
        <SectionWrapper id="partners">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tPartners("title")}
            </h2>
          </div>
          <PartnersSection />
        </SectionWrapper>
      </>
    );
  }

  // Show individual sections when hash is present
  return (
    <>
      {activeSection === "history" && (
        <SectionWrapper id="history" className="bg-background-light">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tHistory("title")}
            </h2>
            {history?.about && (
              <p className="text-text-secondary text-lg w-full leading-relaxed">
                {history.about}
              </p>
            )}
          </div>
          <HistorySection />
        </SectionWrapper>
      )}

      {activeSection === "team" && (
        <SectionWrapper id="team">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tTeam("title")}
            </h2>
          </div>
          <TeamSection />
        </SectionWrapper>
      )}

      {activeSection === "lecturers" && (
        <SectionWrapper id="lecturers" className="bg-background-light">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {tLecturers("title")}
            </h2>
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
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {tVolunteers("title")}
              </h2>
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
