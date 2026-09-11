import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

import { MetaLine } from "@/components/content/meta-line";
import { BinaryDecrypt } from "@/components/motion/binary-decrypt";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { TiltCard } from "@/components/motion/tilt-card";
import { Button } from "@/components/ui/button";
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
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mask-[radial-gradient(120%_90%_at_70%_0%,black,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "58px 58px",
        }}
      />
      {latest ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 inset-s-1/4 size-136 rounded-full opacity-20 blur-[120px]"
          style={{ background: latest.themeColor }}
        />
      ) : null}

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.15fr_minmax(0,19rem)] lg:gap-14">
        <div>
          <Reveal>
            <p className="text-sm text-muted-foreground">{SITE.tagline}</p>
          </Reveal>

          <h1 className="max-w-3xl text-balance text-4xl font-black  md:text-6xl leading-25 h-fit">
            <SplitText text="نشریه‌ی علمی فرهنگی بایت" />
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
            <div style={{ ["--issue-accent" as string]: latest.themeColor }}>
              <TiltCard>
                <Link href={latest.url} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border shadow-[0_30px_80px_-40px_var(--issue-accent)]">
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
              </TiltCard>

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
