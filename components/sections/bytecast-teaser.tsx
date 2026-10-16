import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EpisodeCard } from "@/components/bytecast/episode-card";
import { Reveal } from "@/components/motion/reveal";
import type { Episode } from "@/lib/bytecast";

/** Home-page entry to the podcast: the newest episode. */
export function BytecastTeaser({ episode }: { episode: Episode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Reveal className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">بایت‌کست</h2>
        <Link
          href="/bytecast"
          className="group flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          همه
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </Reveal>
      <Reveal>
        <EpisodeCard episode={episode} />
      </Reveal>
    </section>
  );
}
