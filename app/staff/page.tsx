import type { Metadata } from "next";

import { PersonCard } from "@/components/cards/person-card";
import { getAuthor, getStaffSections } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "اعضای مرکزی",
  description: "اعضای مرکزی نشریه‌ی علمی فرهنگی بایت",
  path: "/staff",
});

export default function StaffPage() {
  const sections = getStaffSections();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-black md:text-4xl">اعضای مرکزی</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          کسانی که بایت را می‌سازند.
        </p>
      </header>

      <div className="space-y-14">
        {sections.map((section) => (
          <section key={section.name}>
            <h2 className="mb-6 text-xl font-bold">{section.name}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.members.map((member) => {
                const author = getAuthor(member.authorId);
                if (!author) return null;
                return (
                  <li key={`${section.name}-${member.authorId}`}>
                    <PersonCard
                      name={author.name}
                      title={author.title}
                      image={author.image}
                      href={author.url}
                      articleCount={author.articleCount}
                      socials={author.socials}
                      className="h-full"
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
