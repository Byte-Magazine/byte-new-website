/**
 * Pull author ids out of legacy <AuthorCallout> tags in MDX bodies.
 *
 * Some articles (notably multi-voice pieces) leave `authors: []` in frontmatter
 * and only credit people via callouts. Those still wrote the piece and must
 * count toward `articleCount` / author grids.
 */
export function authorIdsFromCallouts(body: string): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  const add = (id: string) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };

  for (const match of body.matchAll(
    /<AuthorCallout\b[^>]*?\b(?:author|id)=["']([^"']+)["']/g,
  )) {
    add(match[1]);
  }

  for (const match of body.matchAll(
    /<AuthorCallout\b[^>]*?\bauthors=\{\[([^\]]*)\]\}/g,
  )) {
    for (const idMatch of match[1].matchAll(/["']([^"']+)["']/g)) {
      add(idMatch[1]);
    }
  }

  return ids;
}

/** Frontmatter authors first, then any callout-only credits, de-duplicated. */
export function mergeArticleAuthorIds(
  frontmatterAuthors: string[],
  body: string,
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const id of [...frontmatterAuthors, ...authorIdsFromCallouts(body)]) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(id);
  }
  return merged;
}
