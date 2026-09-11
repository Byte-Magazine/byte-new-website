import { describe, expect, it } from "vitest";

import {
  authorIdsFromCallouts,
  mergeArticleAuthorIds,
} from "./author-credit";

describe("author credit from callouts", () => {
  it("reads singular author= props", () => {
    const body = `
<AuthorCallout author="AmirHosseinShayan">hi</AuthorCallout>
<AuthorCallout author="AynazRahmani">hi</AuthorCallout>
`;
    expect(authorIdsFromCallouts(body)).toEqual([
      "AmirHosseinShayan",
      "AynazRahmani",
    ]);
  });

  it("merges frontmatter and callouts without duplicates", () => {
    const body = `<AuthorCallout author="AmirHosseinShayan">x</AuthorCallout>`;
    expect(
      mergeArticleAuthorIds(["EmadEmamJome", "AmirHosseinShayan"], body),
    ).toEqual(["EmadEmamJome", "AmirHosseinShayan"]);
  });
});
