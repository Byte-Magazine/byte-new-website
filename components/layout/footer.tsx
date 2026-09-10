import Link from "next/link";
import { ClipboardList, Mail, Send } from "lucide-react";
import { SiGithub, SiMedium, SiX } from "@icons-pack/react-simple-icons";

import { LinkedInIcon } from "@/components/icons/linkedin";
import { LogoMark } from "@/components/layout/logo";
import { getStats } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, SITE } from "@/lib/site";

const SOCIALS = [
  { href: SITE.socials.telegram, label: "تلگرام", Icon: Send },
  { href: SITE.socials.github, label: "گیت‌هاب", Icon: SiGithub },
  { href: SITE.socials.linkedin, label: "لینکدین", Icon: LinkedInIcon },
  { href: SITE.socials.x, label: "ایکس", Icon: SiX },
  { href: SITE.socials.medium, label: "مدیوم", Icon: SiMedium },
];

export function Footer() {
  const stats = getStats();

  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-8 text-foreground" />
              <p className="text-lg font-black">{SITE.shortName}</p>
            </div>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">
              {SITE.name} — {SITE.tagline}
            </p>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              <span dir="ltr">{toPersianDigits(stats.articles)}</span> مقاله ·{" "}
              <span dir="ltr">{toPersianDigits(stats.issues)}</span> شماره ·{" "}
              <span dir="ltr">{toPersianDigits(stats.authors)}</span> نویسنده
            </p>
          </div>

          <nav aria-label="ناوبری پاورقی">
            <p className="mb-4 text-sm font-bold">بخش‌ها</p>
            <ul className="space-y-2.5 text-sm">
              {[...NAV_ITEMS, ...SECONDARY_NAV_ITEMS].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 text-sm font-bold">ارتباط با ما</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4 shrink-0" />
                  <span dir="ltr">{SITE.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.joinFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ClipboardList className="size-4 shrink-0" />
                  عضویت در نشریه
                </a>
              </li>
            </ul>

            <p className="mb-3 mt-6 text-sm font-bold">ما را دنبال کنید</p>
            <ul className="flex flex-wrap items-center gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
          <p>{SITE.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
