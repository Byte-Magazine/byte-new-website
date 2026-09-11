import type { Metadata } from "next";
import Image from "next/image";
import { Download } from "lucide-react";

import { getCodenameh } from "@/lib/content";
import { issueAccentValue } from "@/lib/brand-color";
import { toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";
import { codenamehPdfUrl } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "آرشیو کدنامه",
  description: "کدنامه؛ پدر معنوی بایت",
  path: "/codenameh",
});

export default function CodenamehPage() {
  const entries = getCodenameh();

  // Preserve the eras from the legacy data, newest era first.
  const eras = [...new Set(entries.map((entry) => entry.era))].reverse();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-black md:text-4xl">آرشیو کدنامه</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          کدنامه؛ پدر معنوی بایت. {toPersianDigits(entries.length)} شماره که
          به‌صورت پی‌دی‌اف در دسترس هستند.
        </p>
      </header>

      <div className="space-y-14">
        {eras.map((era) => (
          <section key={era}>
            <h2 className="mb-6 text-xl font-bold">{era}</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {entries
                .filter((entry) => entry.era === era)
                .map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={codenamehPdfUrl(entry.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                      style={{
                        ["--issue-accent" as string]: issueAccentValue(
                          entry.themeColor,
                        ),
                      }}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted transition-shadow duration-300 group-hover:shadow-[0_12px_40px_-12px_var(--issue-accent)]">
                        <Image
                          src={entry.cover}
                          alt={`جلد ${entry.description}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <p className="mt-3 font-bold leading-7">{entry.title}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Download className="size-3.5" />
                        {entry.description}
                      </p>
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
