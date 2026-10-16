import { toPersianDigits } from "../persian";

const ORDINALS = [
  "",
  "اول",
  "دوم",
  "سوم",
  "چهارم",
  "پنجم",
  "ششم",
  "هفتم",
  "هشتم",
  "نهم",
  "دهم",
  "یازدهم",
  "دوازدهم",
  "سیزدهم",
  "چهاردهم",
  "پانزدهم",
  "شانزدهم",
  "هفدهم",
  "هجدهم",
  "نوزدهم",
  "بیستم",
];

/** `اول`, `دوم`, … up to twenty; `۲۷ام` beyond. */
export function ordinalFa(n: number): string {
  return ORDINALS[n] || `${toPersianDigits(n)}ام`;
}

/** `قسمت اول` */
export function episodeLabel(n: number): string {
  return `قسمت ${ordinalFa(n)}`;
}

/** `EP.00000001` — the episode number in binary, the magazine's signature. */
export function episodeCode(n: number): string {
  return `EP.${n.toString(2).padStart(8, "0")}`;
}

/** `۲۲ دقیقه`, or `۱ ساعت و ۵ دقیقه`. */
export function durationLabel(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${toPersianDigits(m)} دقیقه`;
  return m === 0
    ? `${toPersianDigits(h)} ساعت`
    : `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
}

/** ISO 8601 duration (`PT21M41S`) for schema.org. */
export function isoDuration(seconds: number): string {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s || (!h && !m) ? `${s}S` : ""}`;
}
