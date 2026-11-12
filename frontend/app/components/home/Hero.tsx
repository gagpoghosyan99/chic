"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Offerings from "./Offerings";

export default function Hero() {
  const t = useTranslations("home");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const tryPlay = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      if (reduced.matches) {
        video.pause();
        return;
      }
      const pending = video.play();
      if (pending) pending.catch(() => {});
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);
    reduced.addEventListener("change", tryPlay);
    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
      reduced.removeEventListener("change", tryPlay);
    };
  }, []);

  return (
    <section data-cover className="relative isolate min-h-[calc(100svh-var(--site-header,6rem))] overflow-hidden bg-primary-dark">
      <img
        src="/hero/chic-hero-poster.jpg"
        alt=""
        width={1280}
        height={720}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[68%_top] xl:object-[right_top]"
      />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-[68%_top] xl:object-[right_top]"
        poster="/hero/chic-hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        width={1280}
        height={720}
        aria-hidden="true"
      >
        <source src="/hero/chic-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/55 to-primary-dark/10 xl:bg-gradient-to-r xl:from-primary-dark xl:via-primary-dark/50 xl:to-transparent" />

      <div className="relative z-10 flex min-h-[calc(100svh-var(--site-header,6rem))] items-end xl:items-center">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12 lg:px-16">
          <div className="max-w-2xl text-white">
            <h1 className="text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {t("coverTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:mt-5 sm:text-lg">
              {t("coverLead")}
            </p>
            <Offerings />
          </div>
        </div>
      </div>
    </section>
  );
}
