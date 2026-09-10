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
