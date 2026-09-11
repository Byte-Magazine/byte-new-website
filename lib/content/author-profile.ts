/**
 * Author profile completeness helpers.
 *
 * Some legacy records point at a shared placeholder SVG or store a quoted
 * blank string as `title`. Those must not count as a real photo / entry year.
 */

const PLACEHOLDER_IMAGES = new Set([
  "/img/authors/noone.svg",
]);

/** True when the author has a real headshot, not the shared placeholder. */
export function authorHasPhoto(image?: string): boolean {
  if (!image) return false;
  return !PLACEHOLDER_IMAGES.has(image);
}

/**
 * True when `title` carries an entry / graduation year (Persian or Latin
 * digits). Placeholder titles like `" "` or `کارشناسی ۱۴XX` do not count.
 */
export function authorHasEntryYear(title?: string): boolean {
  if (!title) return false;
  const trimmed = title.trim();
  if (!trimmed) return false;
  // Quoted whitespace leftovers from the legacy authors dump.
  if (/^["'«»\s]+$/.test(trimmed)) return false;
  if (/۱۴XX|14XX/i.test(trimmed)) return false;
  return /[۰-۹]{4}|[12]\d{3}/.test(trimmed);
}

/** Drop placeholder image paths so UI falls back to initials. */
export function normalizeAuthorImage(image?: string): string | undefined {
  return authorHasPhoto(image) ? image : undefined;
}

/** Drop blank / quoted-empty titles. */
export function normalizeAuthorTitle(title?: string): string | undefined {
  if (!title) return undefined;
  const trimmed = title.trim();
  if (!trimmed) return undefined;
  if (/^["'«»\s]+$/.test(trimmed)) return undefined;
  return trimmed;
}
