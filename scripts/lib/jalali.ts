import { toAsciiDigits } from "../../lib/persian";

/**
 * Converts a Jalali (Persian) date to an ISO Gregorian date string.
 * Implements the standard 33-year-cycle algorithm; no dependency needed
 * because the site only converts a handful of issue dates at build time.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): string {
  const gyBase = jy <= 979 ? 621 : 1600;
  const jyAdj = jy <= 979 ? jy : jy - 979;

  let days =
    365 * jyAdj +
    Math.floor(jyAdj / 33) * 8 +
    Math.floor(((jyAdj % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  let gy = gyBase + 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const monthDays = [
    0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];

  let gm = 1;
  while (gm <= 12 && gd > monthDays[gm]) {
    gd -= monthDays[gm];
    gm++;
  }

  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

/** Parses a legacy Jalali date string like "۱۴۰۴/۰۶/۳۱" into an ISO date. */
export function parseJalaliDate(value: string): string {
  const ascii = toAsciiDigits(value).trim();
  const match = ascii.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) {
    throw new Error(`unrecognized Jalali date: ${value}`);
  }
  return jalaliToGregorian(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  );
}
