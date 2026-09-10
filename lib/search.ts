import { normalizePersian } from "./persian";

export type SearchKind = "article" | "blog" | "workshop" | "author" | "issue";

export interface SearchDoc {
  url: string;
  title: string;
  description: string;
  tags: string[];
  authors: string[];
  kind: SearchKind;
  issue?: string;
}

const WEIGHTS = { title: 10, tag: 6, author: 5, description: 3 } as const;

/**
 * Scores one document against a single normalized term.
 * Returns 0 when the term appears in no field, so callers can require every
 * term to match.
 */
function scoreTerm(doc: SearchDoc, term: string): number {
  let score = 0;

  if (normalizePersian(doc.title).includes(term)) score += WEIGHTS.title;
  if (doc.tags.some((tag) => normalizePersian(tag).includes(term))) {
    score += WEIGHTS.tag;
  }
  if (doc.authors.some((author) => normalizePersian(author).includes(term))) {
    score += WEIGHTS.author;
  }
  if (normalizePersian(doc.description).includes(term)) {
    score += WEIGHTS.description;
  }

  return score;
}

/**
 * Ranks documents against a query. Both sides are normalized first, so a query
 * typed with Arabic yeh, a space instead of a ZWNJ, or Persian digits still
 * matches. Every term must match somewhere.
 */
export function searchDocs(
  docs: SearchDoc[],
  query: string,
  limit = 20,
): SearchDoc[] {
  const terms = normalizePersian(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  const scored: Array<{ doc: SearchDoc; score: number }> = [];

  for (const doc of docs) {
    let total = 0;
    let matchedAll = true;

    for (const term of terms) {
      const score = scoreTerm(doc, term);
      if (score === 0) {
        matchedAll = false;
        break;
      }
      total += score;
    }

    if (matchedAll) scored.push({ doc, score: total });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit)
    .map((entry) => entry.doc);
}
