import Script from "next/script";

import { SITE } from "@/lib/site";

/**
 * Analytics IDs. Both are public (they appear in the page source), so they
 * live in code like the rest of the site config. An empty ID disables that
 * tracker entirely: no script is emitted.
 */
/** Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX". */
export const GA4_MEASUREMENT_ID = "G-SP8RYBVQ8E";
/** Microsoft Clarity project ID, e.g. "abcd1234ef". */
export const CLARITY_PROJECT_ID = "yuw68wjdaj";

/** Only the production host reports; local builds and previews stay silent. */
const HOST = new URL(SITE.url).hostname;
const onProductionHost = `location.hostname === ${JSON.stringify(HOST)}`;

/**
 * Google Analytics 4 and Microsoft Clarity, loaded after the page is
 * interactive so they never delay rendering. GA4's enhanced measurement
 * records client-side navigations as page views (on by default for new
 * web streams), so no router hook is needed.
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {GA4_MEASUREMENT_ID ? (
        <Script id="ga4" strategy="afterInteractive">
          {`if (${onProductionHost}) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", ${JSON.stringify(GA4_MEASUREMENT_ID)});
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ${JSON.stringify(GA4_MEASUREMENT_ID)};
  document.head.appendChild(s);
}`}
        </Script>
      ) : null}

      {CLARITY_PROJECT_ID ? (
        <Script id="clarity" strategy="afterInteractive">
          {`if (${onProductionHost}) {
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", ${JSON.stringify(CLARITY_PROJECT_ID)});
}`}
        </Script>
      ) : null}
    </>
  );
}
