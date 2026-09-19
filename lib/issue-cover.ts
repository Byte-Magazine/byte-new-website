/**
 * Magazine posters are A4 portrait (210 × 297 mm).
 * Use this box ratio everywhere a cover/poster is framed so object-fit never
 * crops the page.
 */
export const ISSUE_COVER_ASPECT_CLASS = "aspect-[210/297]" as const;

/** Width / height — for WebGL planes and non-Tailwind layout. */
export const ISSUE_COVER_ASPECT = 210 / 297;

/**
 * Plane size hints for the archive carousel. Kept near the old 700×900 visual
 * scale, but locked to A4 so the cover shader does not crop.
 */
export const ISSUE_COVER_PLANE = {
  width: 636,
  height: 900,
} as const;
