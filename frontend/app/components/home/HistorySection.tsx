"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { fetchHistory, toAbsoluteStrapiUrl, type History, type RichTextNode } from "@/lib/strapi";

function extractText(nodes: RichTextNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return node.text;
      if ("children" in node) return extractText(node.children);
      return "";
    })
    .join("")
    .trim();
}

function renderRichTextNode(node: RichTextNode, index: number): React.ReactNode {
  switch (node.type) {
    case "text": {
      let content: React.ReactNode = node.text;
      if (node.bold) content = <strong key={index}>{content}</strong>;
      if (node.italic) content = <em key={index}>{content}</em>;
      return content;
    }
    case "paragraph": {
      const children = node.children.map((child, i) => renderRichTextNode(child, i));
      if (!extractText(node.children)) return null;
      return (
        <p key={index} className="text-text-secondary leading-relaxed">
          {children}
        </p>
      );
    }
    case "heading": {
      const level = node.level || 1;
      if (!extractText(node.children)) return null;
      const children = node.children.map((child, i) => renderRichTextNode(child, i));
      const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag key={index} className="text-xl font-semibold text-primary mb-2">
          {children}
        </HeadingTag>
      );
    }
    case "list": {
      const children = node.children.map((child, i) => renderRichTextNode(child, i));
      const Tag = node.format === "ordered" ? "ol" : "ul";
      return (
        <Tag key={index} className="ml-4 list-inside list-disc space-y-2 text-text-secondary">
          {children}
        </Tag>
      );
    }
    case "list-item": {
      const children = node.children.map((child, i) => renderRichTextNode(child, i));
      return (
        <li key={index} className="leading-relaxed">
          {children}
        </li>
      );
    }
    case "link": {
      const children = node.children.map((child, i) => renderRichTextNode(child, i));
      return (
        <a key={index} href={node.url} target={node.target} rel={node.rel} className="text-primary hover:underline">
          {children}
        </a>
      );
    }
    default:
      return null;
  }
}

function parseHistoryContent(historyNodes?: RichTextNode[]) {
  if (!historyNodes?.length) {
    return { mission: null, missionText: null, vision: null, visionText: null, values: [] as string[] };
  }

  let mission: string | null = null;
  let missionText: string | null = null;
  let vision: string | null = null;
  let visionText: string | null = null;
  const values: string[] = [];
  let currentSection: "mission" | "vision" | "values" | null = null;
  let i = 0;

  while (i < historyNodes.length) {
    const node = historyNodes[i];
    if (node.type === "heading") {
      const headingText = extractText(node.children).toLowerCase();
      if (headingText.includes("mission")) {
        currentSection = "mission";
        mission = extractText(node.children);
        const next = historyNodes[i + 1];
        if (next?.type === "paragraph" && "children" in next) {
          missionText = extractText(next.children);
          i++;
        }
      } else if (headingText.includes("vision")) {
        currentSection = "vision";
        vision = extractText(node.children);
        const next = historyNodes[i + 1];
        if (next?.type === "paragraph" && "children" in next) {
          visionText = extractText(next.children);
          i++;
        }
      } else if (headingText.includes("value")) {
        currentSection = "values";
      }
    } else if (node.type === "paragraph" && currentSection === "values") {
      const cleanText = extractText(node.children).replace(/^[🔹•\-\s]+/, "").trim();
      if (cleanText) values.push(cleanText);
    }
    i++;
  }

  return { mission, missionText, vision, visionText, values };
}

export default function HistorySection() {
  const locale = useLocale() as "hy" | "ru" | "en";
  const t = useTranslations("history");
  const [history, setHistory] = useState<History | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchHistory(locale);
        if (isMounted) setHistory(data);
      } catch {
        if (isMounted) setHistory(null);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  const { mission, missionText, vision, visionText, values } = useMemo(
    () => parseHistoryContent(history?.history),
    [history?.history],
  );

  if (isLoading) {
    return (
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(16rem,22rem)_1fr] lg:gap-12">
        <div className="aspect-[4/5] animate-pulse rounded-3xl bg-primary-lighter" />
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-2xl bg-primary-lighter" />
          <div className="h-32 animate-pulse rounded-2xl bg-primary-lighter" />
        </div>
      </div>
    );
  }

  if (!history) return null;

  const founderImageUrl = history.founder_photo
    ? toAbsoluteStrapiUrl(
        history.founder_photo.formats?.medium?.url ||
          history.founder_photo.formats?.small?.url ||
          history.founder_photo.url,
      )
    : "/roz.jpeg";

  const hasStructured = !!(mission && missionText);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(16rem,22rem)_1fr] lg:gap-12">
      <aside className="person-card depth-card relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/70 bg-white lg:mx-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-primary-lighter">
          <Image
            src={founderImageUrl || "/roz.jpeg"}
            alt={history.founder_full_name || "Founder"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 90vw, 22rem"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/35 to-transparent p-5 pt-16">
            {history.founder_full_name && (
              <p className="text-lg font-semibold text-white">{history.founder_full_name}</p>
            )}
            <p className="mt-1 text-sm text-white/80">{t("founderRole")}</p>
          </div>
        </div>
      </aside>

      <div className="space-y-5">
        {hasStructured ? (
          <>
            {mission && missionText && (
              <div className="person-card depth-card rounded-2xl border border-white/70 bg-white p-6 sm:p-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                  {t("missionLabel")}
                </p>
                <h3 className="text-xl font-semibold text-primary sm:text-2xl">{mission}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">{missionText}</p>
              </div>
            )}
            {vision && visionText && (
              <div className="person-card depth-card rounded-2xl border border-white/70 bg-white p-6 sm:p-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                  {t("visionLabel")}
                </p>
                <h3 className="text-xl font-semibold text-primary sm:text-2xl">{vision}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">{visionText}</p>
              </div>
            )}
            {values.length > 0 && (
              <div className="person-card depth-card rounded-2xl border border-white/70 bg-white p-6 sm:p-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                  {t("valuesLabel")}
                </p>
                <h3 className="mb-4 text-xl font-semibold text-primary sm:text-2xl">{t("values")}</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {values.map((value, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-xl bg-primary-lighter/60 px-4 py-3 text-sm text-text-secondary"
                    >
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : history.history?.length ? (
          <div className="person-card depth-card space-y-4 rounded-2xl border border-white/70 bg-white p-6 sm:p-8">
            {history.history.map((node, index) => renderRichTextNode(node, index))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
