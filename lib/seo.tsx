import type { Metadata } from "next";

import { SITE } from "./site";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

interface MetadataInput {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
}

/** Builds page metadata with canonical URL, OG, and Twitter cards. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  authors,
  tags,
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const resolvedDescription = description?.trim() || SITE.description;
  const images = [{ url: image ?? "/img/social-card.png" }];

  return {
    title,
    description: resolvedDescription,
    alternates: { canonical: url },
    openGraph: {
      type: type === "profile" ? "profile" : type,
      locale: SITE.locale,
      siteName: SITE.name,
      title,
      description: resolvedDescription,
      url,
      images,
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
      ...(tags ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images,
    },
  };
}

interface JsonLdAuthor {
  name: string;
  url: string;
}

export interface ArticleJsonLd {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: string;
  url: string;
  inLanguage: string;
  author: Array<{ "@type": "Person"; name: string; url: string }>;
  publisher: { "@type": "Organization"; name: string; url: string };
  keywords?: string;
  isPartOf?: { "@type": "PublicationIssue"; issueNumber: string; url: string };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  date: string;
  authors: JsonLdAuthor[];
  tags?: string[];
  type?: "Article" | "BlogPosting";
  issue?: { number: string; url: string };
}): ArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.date,
    dateModified: input.date,
    mainEntityOfPage: absoluteUrl(input.url),
    url: absoluteUrl(input.url),
    inLanguage: "fa-IR",
    author: input.authors.map((author) => ({
      "@type": "Person" as const,
      name: author.name,
      url: absoluteUrl(author.url),
    })),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    ...(input.tags?.length ? { keywords: input.tags.join(", ") } : {}),
    ...(input.issue
      ? {
          isPartOf: {
            "@type": "PublicationIssue" as const,
            issueNumber: input.issue.number,
            url: absoluteUrl(input.issue.url),
          },
        }
      : {}),
  };
}

export function personJsonLd(input: {
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person" as const,
    name: input.name,
    url: absoluteUrl(input.url),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
    affiliation: {
      "@type": "Organization" as const,
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function issueJsonLd(input: {
  number: string;
  url: string;
  date: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "PublicationIssue" as const,
    issueNumber: input.number,
    datePublished: input.date,
    description: input.description,
    url: absoluteUrl(input.url),
    isPartOf: {
      "@type": "Periodical" as const,
      name: SITE.name,
      url: SITE.url,
    },
  };
}

/** Renders a JSON-LD script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
