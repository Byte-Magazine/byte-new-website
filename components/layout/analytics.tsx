import Script from "next/script";

import { SITE } from "@/lib/site";

const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
const SCRIPT_URL =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim() ||
  "https://cloud.umami.is/script.js";

/**
 * Umami page analytics: cookieless, so no consent banner is needed, and it
 * honours Do Not Track. Renders nothing until NEXT_PUBLIC_UMAMI_WEBSITE_ID is
 * set at build time, and `data-domains` keeps local and preview builds from
 * reporting as the production site.
 */
export function Analytics() {
  if (!WEBSITE_ID) return null;

  return (
    <Script
      src={SCRIPT_URL}
      data-website-id={WEBSITE_ID}
      data-domains={new URL(SITE.url).host}
      data-do-not-track="true"
      strategy="afterInteractive"
    />
  );
}
