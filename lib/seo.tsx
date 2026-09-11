import type { Metadata } from "next";

import { SITE } from "./site";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build-time Open Graph image paths, produced by scripts/generate-og.ts. */
export const ogImage = {
  /** Same asset Docusaurus used (`themeConfig.image`) for link previews. */
  default: () => "/img/social-card.png",
  article: (issue: string, slug: string) => `/og/article-${issue}-${slug}.png`,
  issue: (number: string) => `/og/issue-${number}.png`,
  blog: (slug: string) => `/og/blog-${slug}.png`,
  author: (id: string) => `/og/author-${id}.png`,
};

/** OG image descriptor with dimensions crawlers expect for large previews. */
export function ogImageEntry(path: string, alt: string = SITE.name) {
  const social = path.includes("social-card");
  return {
    url: path,
    width: social ? 2400 : 1200,
    height: social ? 1350 : 630,
    alt,
    type: "image/png" as const,
  };
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
  const images = [ogImageEntry(image ?? ogImage.default(), title)];

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
      images: images.map((entry) => entry.url),
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

/** Publisher identity, emitted once on the home page. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization" as const,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    email: SITE.email,
    logo: absoluteUrl("/img/logo.svg"),
    description: SITE.description,
    sameAs: Object.values(SITE.socials),
    parentOrganization: {
      "@type": "CollegeOrUniversity" as const,
      name: "دانشگاه صنعتی شریف",
    },
  };
}

/** Site-level metadata plus the search action, for the home page. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite" as const,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "fa-IR",
    publisher: { "@type": "Organization" as const, name: SITE.name },
  };
}

/** Breadcrumb trail; helps search results show the section a page sits in. */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
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
