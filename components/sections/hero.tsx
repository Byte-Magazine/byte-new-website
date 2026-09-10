import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BinaryDecrypt } from "@/components/motion/binary-decrypt";
import { Button } from "@/components/ui/button";
import type { Issue } from "@/lib/content";
import { SITE } from "@/lib/site";

/**
 * The hero leads with the publication's own naming scheme: issues are binary
 * numbers, so the newest one resolves bit by bit. That is the single
 * orchestrated motion on the page.
 */
export function Hero({ latest }: { latest?: Issue }) {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Faint grid, the one piece of decoration; masked so it fades out. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
        <p className="text-sm text-muted-foreground">{SITE.tagline}</p>

        <h1 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.45] md:text-6xl md:leading-[1.35]">
          نشریه‌ی علمی فرهنگی بایت
        </h1>

        {latest ? (
          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-muted-foreground">
            <span>تازه‌ترین شماره</span>
            <BinaryDecrypt
              value={latest.number}
              className="font-mono text-2xl font-bold tracking-[0.15em] md:text-3xl"
            />
            <span>{latest.description}</span>
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {latest ? (
            <Button
              render={
                <Link href={latest.url}>
                  خواندن تازه‌ترین شماره
                  <ArrowLeft className="size-4" />
                </Link>
              }
            />
          ) : null}
          <Button
            variant="outline"
            render={<Link href="/articles">همهٔ مقاله‌ها</Link>}
          />
        </div>
      </div>
    </section>
  );
}
