"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { fetchHistory, toAbsoluteStrapiUrl, type History, type RichTextNode } from "@/lib/strapi";

// Helper function to extract text from rich text nodes
function extractText(nodes: RichTextNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return node.text;
      }
      if ("children" in node) {
        return extractText(node.children);
      }
      return "";
    })
    .join("")
    .trim();
}

// Render rich text nodes to React components
function renderRichTextNode(node: RichTextNode, index: number): React.ReactNode {
  switch (node.type) {
    case "text": {
      let content: React.ReactNode = node.text;
      if (node.bold) {
        content = <strong key={index}>{content}</strong>;
      }
      if (node.italic) {
        content = <em key={index}>{content}</em>;
      }
      return content;
    }
    case "paragraph": {
      const children = node.children.map((child, i) => renderRichTextNode(child, i));
      const text = extractText(node.children);
      if (!text) return null;
      return (
        <p key={index} className="text-text-secondary leading-relaxed">
          {children}
        </p>
      );
    }
    case "heading": {
      const level = node.level || 1;
      const text = extractText(node.children);
      if (!text) return null;
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
        <Tag key={index} className="list-disc list-inside space-y-2 text-text-secondary ml-4">
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
        <a
          key={index}
          href={node.url}
          target={node.target}
          rel={node.rel}
          className="text-primary hover:underline"
        >
          {children}
        </a>
      );
    }
    default:
      return null;
  }
}

// Parse history rich text to extract mission, vision, and values
function parseHistoryContent(historyNodes?: RichTextNode[]) {
  if (!historyNodes || historyNodes.length === 0) {
    return { mission: null, missionText: null, vision: null, visionText: null, values: [] };
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
        // Look for the next paragraph as mission text
        if (i + 1 < historyNodes.length) {
          const nextNode = historyNodes[i + 1];
          if (nextNode.type === "paragraph") {
            missionText = extractText(nextNode.children);
            i++; // Skip the paragraph
          }
        }
      } else if (headingText.includes("vision")) {
        currentSection = "vision";
        vision = extractText(node.children);
        // Look for the next paragraph as vision text
        if (i + 1 < historyNodes.length) {
          const nextNode = historyNodes[i + 1];
          if (nextNode.type === "paragraph") {
            visionText = extractText(nextNode.children);
            i++; // Skip the paragraph
          }
        }
      } else if (headingText.includes("value")) {
        currentSection = "values";
      }
    } else if (node.type === "paragraph" && currentSection === "values") {
      const text = extractText(node.children);
      if (text) {
        // Remove emoji and bullet points if present
        const cleanText = text.replace(/^[🔹•\-\s]+/, "").trim();
        if (cleanText) {
          values.push(cleanText);
        }
      }
    }

    i++;
  }

  return { mission, missionText, vision, visionText, values };
}

export default function HistorySection() {
  const locale = useLocale() as "hy" | "ru" | "en";
  const [history, setHistory] = useState<History | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchHistory(locale);
        if (isMounted) {
          setHistory(data);
        }
      } catch (e) {
        if (isMounted) setHistory(null);
      }
      if (isMounted) setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  const { mission, missionText, vision, visionText, values } = useMemo(() => {
    return parseHistoryContent(history?.history);
  }, [history?.history]);

  // Render all history paragraphs if structured content is not found
  const renderHistoryContent = () => {
    if (mission && missionText) {
      return (
        <>
          {mission && missionText && (
            <div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {mission}
              </h3>
              <p className="text-text-secondary leading-relaxed">{missionText}</p>
            </div>
          )}
          {vision && visionText && (
            <div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {vision}
              </h3>
              <p className="text-text-secondary leading-relaxed">{visionText}</p>
            </div>
          )}
          {values.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Values
              </h3>
              <ul className="space-y-2">
                {values.map((value, index) => (
                  <li key={index} className="flex items-start gap-2 text-text-secondary">
                    <span className="text-primary mt-1">•</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      );
    }

    // Fallback: render all nodes from history
    if (history?.history && history.history.length > 0) {
      return (
        <div className="space-y-4">
          {history.history.map((node, index) => renderRichTextNode(node, index))}
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-lg bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded mt-4 animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!history) {
    return null;
  }

  const founderImageUrl = history.founder_photo
    ? toAbsoluteStrapiUrl(
        history.founder_photo.formats?.medium?.url ||
        history.founder_photo.formats?.small?.url ||
        history.founder_photo.url
      )
    : "/roz.jpeg";

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-6 lg:gap-8 items-start">
      <div className="flex flex-col items-start p-0">
        <div className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-lg p-0">
          <Image
            src={founderImageUrl || "/roz.jpeg"}
            alt={history.founder_full_name || "Founder"}
            fill
            className="object-cover"
          />
        </div>
        {history.founder_full_name && (
          <p className="text-left mt-2 text-text-secondary font-medium p-0 w-72">
            {history.founder_full_name}
          </p>
        )}
      </div>
      <div className="space-y-6 w-full">
        {renderHistoryContent()}
      </div>
    </div>
  );
}
