import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

import { MetaLine } from "@/components/content/meta-line";
import { BinaryDecrypt } from "@/components/motion/binary-decrypt";
import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Button } from "@/components/ui/button";
import { grainientPalette, issueAccentValue } from "@/lib/brand-color";
import type { Issue } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { SITE } from "@/lib/site";
import Image from "next/image";

/**
 * The hero pairs the publication's name with its newest cover.
 *
 * Motion is limited to one orchestrated entrance — the title resolving word by
 * word while the issue number decodes from binary — because that binary naming
 * is the magazine's own identity, not decoration borrowed from elsewhere.
 */
export function Hero({ latest }: { latest?: Issue }) {
  const palette = grainientPalette(latest?.themeColor);

  return (
    <section className="relative overflow-hidden border-b">
      <HeroBackdrop palette={palette} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1.15fr_minmax(0,19rem)] lg:gap-14 lg:py-24">
        <div>
          <Reveal>
            <p className="text-sm text-muted-foreground">{SITE.tagline}</p>
          </Reveal>

          {/* Persian needs generous leading: descenders and diacritics
              collide below about 1.5 at display sizes. The clamp grows at
              2.6vw so the jump through the md breakpoint stays gentle. */}
          <h1 className="mt-5 max-w-3xl text-[clamp(1.75rem,1.1rem+2.6vw,3.25rem)] font-black leading-[1.62] md:leading-[1.5]">
            <span className="inline-flex max-w-full flex-wrap items-baseline gap-x-[0.3em]">
              <span className="max-w-full whitespace-nowrap">
                <SplitText text="نشریه‌ی علمی فرهنگی" />
              </span>
              <span>
                <SplitText text="بایت" delay={165} />
              </span>
            </span>
          </h1>

          <Reveal delay={280}>
            <p className="mt-6 max-w-xl text-lg leading-9 text-muted-foreground">
              نوشته‌های دانشجویی دربارهٔ علوم و مهندسی کامپیوتر
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {latest ? (
                <Magnetic>
                  <Button
                    size="lg"
                    render={
                      <Link href={latest.url}>
                        خواندن شمارهٔ {latest.description}
                        <ArrowLeft className="size-4" />
                      </Link>
                    }
                  />
                </Magnetic>
              ) : null}
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/articles">همهٔ مقاله‌ها</Link>}
              />
            </div>
          </Reveal>
        </div>

        {latest ? (
          <Reveal delay={200}>
            <div
              className="mx-auto w-full max-w-[15rem] lg:mx-0 lg:max-w-none"
              style={{
                ["--issue-accent" as string]: issueAccentValue(
                  latest.themeColor,
                ),
              }}
            >
              <Link href={latest.url} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border shadow-[0_30px_80px_-40px_var(--issue-accent)] transition-transform duration-500 group-hover:-translate-y-1">
                  <Image
                    src={latest.cover}
                    alt={`جلد شمارهٔ ${latest.number}`}
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 1024px) 70vw, 20rem"
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <BinaryDecrypt
                    value={latest.number}
                    className="font-mono text-sm font-bold tracking-[0.18em]"
                  />
                  <MetaLine
                    className="mt-0.5 text-xs"
                    items={[
                      formatJalali(latest.date),
                      `${toPersianDigits(latest.articleCount)} مطلب`,
                    ]}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  render={
                    <a
                      href={latest.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="size-4" />
                      پی‌دی‌اف
                    </a>
                  }
                />
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
