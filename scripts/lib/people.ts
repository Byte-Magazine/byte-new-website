import { normalizePersian } from "../../lib/persian";
import type { AuthorRecord, StaffSection } from "../../lib/content/schema";

export type LegacyPerson = {
  name: string;
  title?: string;
  image_url?: string;
  url?: string;
  socials?: Record<string, string>;
};

export type LegacyStaffSection = {
  name: string;
  staffList: Array<{
    name: string;
    title?: string;
    imageURL?: string;
    socials?: Record<string, string>;
  }>;
};

const SOCIAL_BASES: Record<string, string> = {
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/in/",
  x: "https://x.com/",
  telegram: "https://t.me/",
};

/** Expands a bare social handle into a full URL; passes URLs through. */
export function expandSocialUrl(platform: string, value: string): string {
  if (!value) return value;
  if (/^https?:\/\//.test(value)) return value;
  const base = SOCIAL_BASES[platform];
  return base ? `${base}${value.replace(/^@/, "")}` : value;
}

/**
 * Key for matching a person across sources. Beyond the usual folds it also
 * removes spaces, because the same name appears written both with a ZWNJ
 * ("علی‌نژاد") and with a space ("علی نژاد").
 */
function nameKey(name: string): string {
  return normalizePersian(name).replace(/\s+/g, "");
}

function expandSocials(socials: Record<string, string> = {}) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(socials)) {
    if (value) out[key] = expandSocialUrl(key, value);
  }
  return out;
}

/**
 * Unifies the three legacy people sources into a single author list plus a
 * staff structure that references authors by id.
 *
 * Authors appear in both `mags/authors.json` and `blog/authors.yml` with
 * differing social formats, and again in the staff list by display name only,
 * so matching is done on the normalized name.
 */
export function mergeAuthors(
  magsAuthors: Record<string, LegacyPerson>,
  blogAuthors: Record<string, LegacyPerson>,
  staffSections: LegacyStaffSection[],
): { authors: AuthorRecord[]; staff: StaffSection[]; warnings: string[] } {
  const warnings: string[] = [];
  const byId = new Map<string, AuthorRecord>();

  const ingest = (source: Record<string, LegacyPerson>) => {
    for (const [id, person] of Object.entries(source)) {
      const existing = byId.get(id);
      byId.set(id, {
        id,
        name: person.name || existing?.name || id,
        title: person.title ?? existing?.title,
        image: person.image_url ?? existing?.image,
        socials: {
          ...(existing?.socials ?? {}),
          ...expandSocials(person.socials),
        },
      });
    }
  };

  ingest(magsAuthors);
  ingest(blogAuthors);

  const byName = new Map<string, string>();
  for (const author of byId.values()) {
    byName.set(nameKey(author.name), author.id);
  }

  const staff: StaffSection[] = staffSections.map((section) => ({
    name: section.name,
    members: section.staffList.map((member) => {
      const authorId = byName.get(nameKey(member.name));
      if (!authorId) {
        warnings.push(
          `staff member "${member.name}" in section "${section.name}" has no matching author record`,
        );
      }
      return {
        authorId,
        name: member.name,
        title: member.title,
        image: member.imageURL,
        socials: expandSocials(member.socials),
      };
    }),
  }));

  return {
    authors: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)),
    staff,
    warnings,
  };
}
