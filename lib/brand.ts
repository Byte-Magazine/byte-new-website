import { getLatestIssue } from "./content";
import {
  accentFromColor,
  accentStyleTag,
  BRAND_ACCENT_FALLBACK,
  grainientPalette,
  issueAccentValue,
  issueAccentVars,
  type BrandAccent,
  type GrainientPalette,
} from "./brand-color";

export {
  accentFromColor,
  accentStyleTag,
  grainientPalette,
  issueAccentValue,
  issueAccentVars,
  type BrandAccent,
  type GrainientPalette,
};

/**
 * The site's accent, taken from the newest issue at build time, so the whole
 * site takes on the colour of the current cover.
 *
 * Server-only: touches the content graph (`node:fs`). Client components must
 * import colour helpers from `@/lib/brand-color` instead.
 */
export function siteAccent(): BrandAccent {
  const latest = getLatestIssue();
  return latest ? accentFromColor(latest.themeColor) : BRAND_ACCENT_FALLBACK;
}
