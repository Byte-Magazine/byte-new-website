const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Converts ASCII digits in a string to Persian digits. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Converts Persian and Arabic-Indic digits to ASCII. */
export function toAsciiDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * Folds the character variants that make Persian text matching unreliable:
 * Arabic yeh/kaf vs Persian, ZWNJ and other zero-width marks, diacritics,
 * tatweel, and digit sets. Used for search, slugs, and name matching so that
 * "برنامه‌نويسی" and "برنامه نویسی" compare equal.
 */
export function normalizePersian(input: string): string {
  return toAsciiDigits(input)
    .replace(/[يى]/g, "ی") // ي, ى -> ی
    .replace(/ك/g, "ک") // ك -> ک
    .replace(/[ة]/g, "ه") // ة -> ه
    .replace(/[ً-ٰٟ]/g, "") // diacritics
    .replace(/ـ/g, "") // tatweel
    .replace(/[​-‏‪-‮⁦-⁩﻿]/g, "") // zero-width / bidi marks
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Comparison key for matching two pieces of Persian text that may differ only
 * in word separation. Beyond the usual folds it removes spaces, because the
 * same words appear written both with a ZWNJ ("برنامه‌نویسی") and with a space
 * ("برنامه نویسی"). Use for matching names and titles, not for search.
 */
export function looseKey(input: string): string {
  return normalizePersian(input).replace(/\s+/g, "");
}

const JALALI_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function jalaliFormatter(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options);
  let formatter = JALALI_FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      ...options,
      timeZone: "UTC",
    });
    JALALI_FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}

/** Strips bidi control characters Intl inserts around numeric date parts. */
function cleanPart(value: string): string {
  return value.replace(/[‎‏؜]/g, "");
}

/** Formats an ISO date as a Jalali slash date, e.g. "۱۴۰۴/۰۶/۳۱". */
export function formatJalali(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  const parts = jalaliFormatter({
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    cleanPart(parts.find((p) => p.type === type)?.value ?? "");
  return `${get("year")}/${get("month")}/${get("day")}`;
}

/** Formats an ISO date with the Persian month name, e.g. "۳۱ شهریور ۱۴۰۴". */
export function formatJalaliLong(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return cleanPart(
    jalaliFormatter({
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date),
  );
}

/**
 * Persian letters to a Latin approximation, for URL slugs.
 *
 * Non-ASCII path segments are legal but awkward: they must be percent-encoded
 * in links and sitemaps, and Next's dev server does not resolve them reliably
 * as static params. An ASCII slug keeps every tag URL readable and routable.
 */
const TRANSLITERATION: Record<string, string> = {
  ا: "a", آ: "a", أ: "a", إ: "a", ب: "b", پ: "p", ت: "t", ث: "s",
  ج: "j", چ: "ch", ح: "h", خ: "kh", د: "d", ذ: "z", ر: "r", ز: "z",
  ژ: "zh", س: "s", ش: "sh", ص: "s", ض: "z", ط: "t", ظ: "z", ع: "a",
  غ: "gh", ف: "f", ق: "gh", ک: "k", گ: "g", ل: "l", م: "m", ن: "n",
  و: "v", ه: "h", ی: "i", ء: "", ة: "h", "٫": "",
};

/**
 * Converts Persian text to an ASCII slug, leaving Latin text as it is.
 * Purely for URLs — never for anything a reader sees.
 */
export function transliterate(input: string): string {
  // ZWNJ separates words visually in Persian, so it becomes a hyphen here even
  // though `normalizePersian` strips it for matching.
  const normalized = normalizePersian(input.replace(/\u200c/g, " "));
  let out = "";

  for (const char of normalized) {
    if (/[a-z0-9]/.test(char)) out += char;
    else if (char in TRANSLITERATION) out += TRANSLITERATION[char];
    else if (/\s/.test(char)) out += "-";
    else if (char === "-" || char === "_") out += "-";
  }

  return out.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const WORDS_PER_MINUTE = 200;

/**
 * Estimates reading time in whole minutes, ignoring code blocks, HTML/JSX
 * tags, and markdown punctuation so syntax does not inflate the count.
 */
export function readingTimeMinutes(text: string): number {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>[\]()!\-|]/g, " ");
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
