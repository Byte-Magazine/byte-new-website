import { getLatestIssue } from "./content";

/** sRGB channel (0-255) to linear light. */
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Converts an sRGB colour to OKLCH.
 *
 * The design tokens are written in OKLCH so lightness can be adjusted without
 * shifting hue — which is what makes an arbitrary issue colour usable as an
 * accent in both a light and a dark theme.
 */
function rgbToOklch(r: number, g: number, b: number): {
  l: number;
  c: number;
  h: number;
} {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.sqrt(okA * okA + okB * okB);
  let hue = (Math.atan2(okB, okA) * 180) / Math.PI;
  if (hue < 0) hue += 360;

  return { l: okL, c: chroma, h: hue };
}

/** Parses the `rgb()` / `rgba()` strings the issue data stores. */
function parseRgb(value: string): [number, number, number] | null {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => Number(part.trim()));
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
  return [parts[0], parts[1], parts[2]];
}

export interface BrandAccent {
  /** Accent for the light theme: dark enough to read on a white ground. */
  light: string;
  /** Accent for the dark theme: light enough to read on a dark ground. */
  dark: string;
  /** Tinted surface behind selections, one per theme. */
  softLight: string;
  softDark: string;
  /** Foreground to place on top of the accent. */
  onLight: string;
  onDark: string;
}

const FALLBACK: BrandAccent = {
  light: "oklch(0.36 0.09 264)",
  dark: "oklch(0.83 0.11 250)",
  softLight: "oklch(0.94 0.03 264)",
  softDark: "oklch(0.3 0.05 258)",
  onLight: "oklch(0.99 0.003 265)",
  onDark: "oklch(0.18 0.03 265)",
};

/**
 * Derives a readable accent pair from an arbitrary issue colour.
 *
 * The issue colours are stored as low-alpha rgba intended for glows, so only
 * the hue is trusted. Lightness and chroma are clamped to values that keep
 * text legible on each theme's background, which a raw brand colour would not
 * guarantee.
 */
export function accentFromColor(color: string): BrandAccent {
  const rgb = parseRgb(color);
  if (!rgb) return FALLBACK;

  const { c, h } = rgbToOklch(rgb[0], rgb[1], rgb[2]);
  // Very desaturated source colours would produce a grey accent; give them a
  // floor so the identity still reads.
  const chroma = Math.min(0.16, Math.max(0.07, c));
  const hue = h.toFixed(1);

  return {
    light: `oklch(0.45 ${chroma.toFixed(3)} ${hue})`,
    dark: `oklch(0.78 ${chroma.toFixed(3)} ${hue})`,
    softLight: `oklch(0.94 ${(chroma * 0.35).toFixed(3)} ${hue})`,
    softDark: `oklch(0.32 ${(chroma * 0.5).toFixed(3)} ${hue})`,
    onLight: "oklch(0.99 0.005 " + hue + ")",
    onDark: "oklch(0.17 0.02 " + hue + ")",
  };
}

/**
 * The site's accent, taken from the newest issue at build time, so the whole
 * site takes on the colour of the current cover.
 */
export function siteAccent(): BrandAccent {
  const latest = getLatestIssue();
  return latest ? accentFromColor(latest.themeColor) : FALLBACK;
}

/**
 * Inline CSS variables that retint a subtree to one issue's colour.
 *
 * An issue's own pages should carry that issue's identity, not the site-wide
 * accent taken from the newest issue. Both light and dark values are set, and
 * the browser picks via `light-dark()`, so a theme switch needs no JavaScript.
 */
export function issueAccentVars(
  themeColor: string,
): Record<string, string> {
  const accent = accentFromColor(themeColor);
  return {
    "--issue-accent": themeColor,
    "--accent": `light-dark(${accent.light}, ${accent.dark})`,
    "--accent-foreground": `light-dark(${accent.onLight}, ${accent.onDark})`,
    "--accent-soft": `light-dark(${accent.softLight}, ${accent.softDark})`,
    "--primary": `light-dark(${accent.light}, ${accent.dark})`,
    "--primary-foreground": `light-dark(${accent.onLight}, ${accent.onDark})`,
    "--ring": `light-dark(${accent.light}, ${accent.dark})`,
  };
}

/** CSS custom properties that override the static accent tokens. */
export function accentStyleTag(accent: BrandAccent): string {
  return `
:root {
  --accent: ${accent.light};
  --accent-foreground: ${accent.onLight};
  --accent-soft: ${accent.softLight};
  --primary: ${accent.light};
  --primary-foreground: ${accent.onLight};
  --ring: ${accent.light};
}
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --accent: ${accent.dark};
    --accent-foreground: ${accent.onDark};
    --accent-soft: ${accent.softDark};
    --primary: ${accent.dark};
    --primary-foreground: ${accent.onDark};
    --ring: ${accent.dark};
  }
}
.dark {
  --accent: ${accent.dark};
  --accent-foreground: ${accent.onDark};
  --accent-soft: ${accent.softDark};
  --primary: ${accent.dark};
  --primary-foreground: ${accent.onDark};
  --ring: ${accent.dark};
}
`.trim();
}
