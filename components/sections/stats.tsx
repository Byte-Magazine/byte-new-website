import { PersianCount } from "@/components/motion/persian-count";
import { Reveal } from "@/components/motion/reveal";
import type { SiteStats } from "@/lib/content";

const LABELS: Array<{ key: keyof SiteStats; label: string }> = [
  { key: "articles", label: "مقاله" },
  { key: "authors", label: "نویسنده" },
  { key: "issues", label: "شماره" },
  { key: "codenameh", label: "کدنامه" },
];

/** Every number here is counted at build time from the content graph. */
export function Stats({ stats }: { stats: SiteStats }) {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-4 py-14 md:grid-cols-4">
        {LABELS.map((item, index) => (
          <Reveal key={item.key} delay={index * 90} className="text-center">
            <PersianCount
              to={stats[item.key]}
              className="block font-mono text-4xl font-black tabular-nums md:text-5xl"
            />
            <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
