"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6 9 12l6 6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
      )}
    </svg>
  );
}

export default function CardScroller({ label, children }: { label: string; children: ReactNode }) {
  const t = useTranslations("home");
  const trackRef = useRef<HTMLDivElement>(null);
  const announced = useRef<number | null>(null);
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(slides.length > 1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let frame = 0;
    const settle = () => {
      const nodes = [...el.querySelectorAll<HTMLElement>("[data-slide]")];
      const center = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      nodes.forEach((node, i) => {
        const mid = node.offsetLeft + node.offsetWidth / 2;
        const distance = Math.abs(mid - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = i;
        }
      });
      setIndex(nearest);
      setCanPrev(el.scrollLeft > 8);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(settle);
    };

    settle();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", settle);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", settle);
    };
  }, [slides.length]);

  useEffect(() => {
    if (announced.current === null) {
      announced.current = index;
      return;
    }
    if (announced.current === index) return;
    announced.current = index;
    setStatus(t("slideStatus", { current: index + 1, total: slides.length }));
  }, [index, slides.length, t]);

  const scrollByDir = (direction: number) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    const amount = (slide?.offsetWidth ?? el.clientWidth * 0.85) + 16;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * amount, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="card-scroll-btn absolute left-0 top-1/2 z-10 grid -translate-y-1/2 place-items-center xl:hidden"
        aria-label={t("previous")}
        disabled={!canPrev}
        onClick={() => scrollByDir(-1)}
      >
        <Chevron direction="left" />
      </button>
      <button
        type="button"
        className="card-scroll-btn absolute right-0 top-1/2 z-10 grid -translate-y-1/2 place-items-center xl:hidden"
        aria-label={t("next")}
        disabled={!canNext}
        onClick={() => scrollByDir(1)}
      >
        <Chevron direction="right" />
      </button>

      <div
        ref={trackRef}
        className="card-scroller depth-grid flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-ps-12 scroll-pe-12 px-12 xl:grid xl:snap-none xl:grid-cols-3 xl:scroll-ps-0 xl:scroll-pe-0 xl:gap-6 xl:overflow-visible xl:px-0"
        tabIndex={0}
        role="group"
        aria-label={label}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={t("slideStatus", { current: i + 1, total: slides.length })}
            className="w-[85%] shrink-0 snap-start sm:w-[48%] xl:w-auto xl:shrink"
          >
            {slide}
          </div>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
