export const SITE = {
  name: "نشریه‌ی علمی فرهنگی بایت",
  shortName: "بایت",
  tagline: "دانشکده‌ی مهندسی کامپیوتر دانشگاه صنعتی شریف",
  description:
    "نشریه‌ی علمی فرهنگی بایت، دانشکده‌ی مهندسی کامپیوتر دانشگاه صنعتی شریف",
  url: "https://byte-mag.ir",
  locale: "fa_IR",
  email: "bytepublication@gmail.com",
  joinFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSfjtbcWu6cLSklvKAXpqJ0P0tm4yis5t9VN_C0PsCptgpDAxQ/viewform",
  socials: {
    telegram: "https://t.me/byte_mag",
    github: "https://github.com/Byte-Magazine",
    linkedin: "https://www.linkedin.com/company/byte-publication/",
    x: "https://twitter.com/BytePublication",
    medium: "https://medium.com/@bytepublication",
  },
  github: "https://github.com/Byte-Magazine",
  copyright:
    "© نشریه‌ی علمی فرهنگی بایت - دانشکده مهندسی کامپیوتر - دانشگاه صنعتی شریف",
} as const;

const PDF_BASE = "https://byte-mag.s3.ir-thr-at1.arvanstorage.ir";

/** Public URL of an issue's PDF on the CDN. */
export function pdfUrl(issue: string): string {
  return `${PDF_BASE}/mags/${issue}.pdf`;
}

/** Public URL of a codenameh issue's PDF on the CDN. */
export function codenamehPdfUrl(id: string): string {
  return `${PDF_BASE}/codenameh/${id}.pdf`;
}

export const NAV_ITEMS = [
  { href: "/mags/intro", label: "آرشیو بایت" },
  { href: "/articles", label: "مقاله‌ها" },
  { href: "/codenameh", label: "آرشیو کدنامه" },
  { href: "/workshops", label: "کارگاه‌ها" },
  { href: "/blog", label: "وبلاگ" },
] as const;

export const SECONDARY_NAV_ITEMS = [
  { href: "/staff", label: "اعضای مرکزی" },
  { href: "/authors", label: "نویسندگان" },
] as const;

export const ALL_NAV_ITEMS = [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS];
