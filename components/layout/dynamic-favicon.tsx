"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const LOGO_PATH =
  "M82.8616 120.61H150.731V405.15C150.731 491.17 220.337 560.9 306.203 560.9H322.464C408.331 560.9 477.877 491.17 477.877 405.15V313.88C477.877 227.86 408.331 158.13 322.464 158.13H290.062V229.48H317.354C366.646 229.48 406.655 269.56 406.655 319V400.03C406.655 449.41 366.646 489.49 317.354 489.49H311.304C262.012 489.49 222.004 449.41 222.004 400.03V0H161.871L82.8516 79.23V120.61H82.8616Z";

/** Resolve the live `--primary` (issue pages override it) to a concrete colour. */
function currentPrimary(): string {
  const scope =
    document.querySelector("#main main") ?? document.documentElement;
  const probe = document.createElement("span");
  probe.style.color = "var(--primary)";
  probe.style.display = "none";
  scope.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function applyFavicon() {
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 561 561"><path d="${LOGO_PATH}" fill="${currentPrimary()}"/></svg>`;
    const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    let link = document.querySelector<HTMLLinkElement>(
      'link[rel="icon"][data-dynamic]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.dataset.dynamic = "true";
      document.head.appendChild(link);
    }
    link.href = href;
  } catch {
    // Keep the static favicon.
  }
}

/** Keeps the tab icon in step with the page's primary colour. */
export function DynamicFavicon() {
  const pathname = usePathname();

  useEffect(() => {
    applyFavicon();
    // Theme toggle flips `.dark` on <html>, which changes `--primary`.
    const observer = new MutationObserver(applyFavicon);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
