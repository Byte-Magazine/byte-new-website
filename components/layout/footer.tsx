import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";

import { ALL_NAV_ITEMS, SITE } from "@/lib/site";
import { getStats } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";

export function Footer() {
  const stats = getStats();

  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-black">{SITE.name}</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {SITE.tagline}
            </p>
            <p className="mt-4 font-mono text-xs text-muted-foreground" dir="ltr">
              {toPersianDigits(stats.articles)} مقاله ·{" "}
              {toPersianDigits(stats.issues)} شماره ·{" "}
              {toPersianDigits(stats.authors)} نویسنده
            </p>
          </div>

          <nav aria-label="ناوبری پاورقی">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3 md:grid-cols-2">
              {ALL_NAV_ITEMS.map((item) => (
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
        </div>

        <div className="mt-10 flex flex-col-reverse items-start gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{SITE.copyright}</p>
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <SiGithub className="size-4" />
            گیت‌هاب
          </a>
        </div>
      </div>
    </footer>
  );
}
