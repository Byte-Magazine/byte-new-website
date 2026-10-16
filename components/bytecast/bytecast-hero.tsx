import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import { HeroBackdrop } from "@/components/motion/hero-backdrop";
import { Magnetic } from "@/components/motion/magnetic";
import { PersianCount } from "@/components/motion/persian-count";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Button } from "@/components/ui/button";
import { grainientPalette } from "@/lib/brand-color";
import {
  getAllEpisodes,
  getLatestEpisode,
  SEASONS,
  SHOW,
} from "@/lib/bytecast";
import { episodeLabel } from "@/lib/bytecast/labels";

import { BytecastLogo } from "./bytecast-logo";
import { CopyFeedButton } from "./copy-feed-button";

const palette = grainientPalette();

/**
 * The show's front door: wordmark, a one-line promise, how to listen, and a
 * strip that puts the newest episode one click away. Backdrop and entrance
 * reuse the home hero's motion pieces (WebGL only on capable wide screens).
 */
export function BytecastHero({ feedUrl }: { feedUrl: string }) {
  const latest = getLatestEpisode();
  const episodes = getAllEpisodes();
  const minutes = Math.round(
    episodes.reduce((sum, episode) => sum + episode.audio.duration, 0) / 60,
  );
  const guests = new Set(episodes.map((episode) => episode.guest.name)).size;

  const stats = [
    { value: episodes.length, label: "قسمت" },
    { value: guests, label: "مهمان" },
    { value: minutes, label: "دقیقه گفت‌وگو" },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b">
      <HeroBackdrop palette={palette} />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10 text-center md:py-14">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            <span dir="ltr" className="font-mono font-semibold text-foreground">
              ByteCast
            </span>
            · بایت‌کست · {SEASONS[0]?.title}
          </p>
        </Reveal>

        <h1 className="mt-6">
          <BytecastLogo
            animated
            className="mx-auto h-14 w-auto text-foreground md:h-20"
          />
        </h1>

        <p className="mt-6 text-[clamp(1.25rem,1rem+1.6vw,2rem)] font-black leading-[1.7]">
          <SplitText text={SEASONS[0]?.tagline ?? SHOW.name} delay={500} />
        </p>

        <Reveal delay={350}>
          <p className="mt-3 max-w-3xl text-base leading-9 text-muted-foreground md:text-lg md:leading-10">
            دربارهٔ مسیر پژوهش، آموزش، صنعت و تجربهٔ دانشجویی؛ هر قسمت با یک
            استاد و یک مصاحبه‌کننده.
          </p>
        </Reveal>

        <Reveal delay={450}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {latest ? (
              <Magnetic>
                <Button
                  size="lg"
                  render={
                    <Link href={latest.url}>
                      <Play className="size-4 fill-current" />
                      گوش دادن به {episodeLabel(latest.number)}
                    </Link>
                  }
                />
              </Magnetic>
            ) : null}
            <CopyFeedButton path={feedUrl} />
          </div>
        </Reveal>

        <Reveal delay={550} className="mt-8 w-full">
          <dl className="mx-auto grid max-w-xl grid-cols-3 [&>div+div]:border-s rounded-xl border bg-card/60">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 py-3">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <PersianCount
                    to={stat.value}
                    className="block text-xl font-black md:text-2xl"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
