import type { Metadata } from "next";

import { FEED_PATH, SITE } from "./site";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Absolute URL of a page as it is actually served. The site exports with
 * `trailingSlash: true`, so canonical tags and sitemap entries must agree on
 * the slashed form or crawlers see two URLs for every page.
 */
export function pageUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${clean.endsWith("/") ? clean : `${clean}/`}`;
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

/**
 * Past this many characters the " | بایت" suffix would push the title beyond
 * what results pages show, so long titles are emitted on their own.
 */
const TITLE_SUFFIX_MAX = 55;

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
  const url = pageUrl(path);
  const resolvedDescription = description?.trim() || SITE.description;
  const images = [ogImageEntry(image ?? ogImage.default(), title)];

  return {
    title: title.length > TITLE_SUFFIX_MAX ? { absolute: title } : title,
    description: resolvedDescription,
    // Child `alternates` replaces the layout's wholesale, so the feed link
    // has to be repeated here to stay in every page's <head>.
    alternates: {
      canonical: url,
      types: { "application/rss+xml": FEED_PATH },
    },
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
  datePublished?: string;
  dateModified?: string;
  mainEntityOfPage: string;
  url: string;
  inLanguage: string;
  isAccessibleForFree: true;
  image?: string[];
  author: Array<{ "@type": "Person"; name: string; url: string }>;
  publisher: { "@type": "Organization"; name: string; url: string };
  keywords?: string;
  isPartOf?: { "@type": "PublicationIssue"; issueNumber: string; url: string };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  /** Omitted for undated documents such as workshop lessons. */
  date?: string;
  authors: JsonLdAuthor[];
  tags?: string[];
  type?: "Article" | "BlogPosting" | "TechArticle";
  /** Site-relative preview image; required by Google for Article rich results. */
  image?: string;
  issue?: { number: string; url: string };
}): ArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "Article",
    headline: input.title,
    description: input.description,
    ...(input.date
      ? { datePublished: input.date, dateModified: input.date }
      : {}),
    mainEntityOfPage: pageUrl(input.url),
    url: pageUrl(input.url),
    inLanguage: "fa-IR",
    isAccessibleForFree: true,
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    author: input.authors.map((author) => ({
      "@type": "Person" as const,
      name: author.name,
      url: pageUrl(author.url),
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
            url: pageUrl(input.issue.url),
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
    url: pageUrl(input.url),
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
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "PublicationIssue" as const,
    name: `${SITE.shortName}، شمارهٔ ${input.number}`,
    issueNumber: input.number,
    datePublished: input.date,
    inLanguage: "fa-IR",
    isAccessibleForFree: true,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    url: pageUrl(input.url),
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
      item: pageUrl(item.url),
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
