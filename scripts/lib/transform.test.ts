import { describe, it, expect } from "vitest";
import {
  stripSiteImports,
  convertAdmonitions,
  normalizeTag,
  buildTagMap,
  parseOrderFromDirname,
  rewriteImagePaths,
  findUnknownJsxTags,
} from "./transform";

describe("stripSiteImports", () => {
  it("removes @site imports", () => {
    const input = 'import Tooltip from "@site/src/components/Tooltip";\n\nمتن';
    expect(stripSiteImports(input).trim()).toBe("متن");
  });

  it("removes multiple imports and collapses blank lines", () => {
    const input = 'import A from "@site/a";\nimport B from "@site/b";\n\n# عنوان';
    expect(stripSiteImports(input).trim()).toBe("# عنوان");
  });

  it("keeps non-@site imports untouched", () => {
    const input = 'import X from "./x";\n\nمتن';
    expect(stripSiteImports(input)).toContain('import X from "./x"');
  });

  it("handles single-quoted imports", () => {
    const input = "import T from '@site/src/components/Tooltip';\n\nمتن";
    expect(stripSiteImports(input).trim()).toBe("متن");
  });
});

describe("convertAdmonitions", () => {
  it("converts a simple tip", () => {
    const input = ":::tip\nمحتوا\n:::";
    expect(convertAdmonitions(input)).toBe(
      '<Callout type="tip">\nمحتوا\n</Callout>',
    );
  });

  it("converts an admonition with a title", () => {
    const input = ":::warning هشدار\nمحتوا\n:::";
    expect(convertAdmonitions(input)).toBe(
      '<Callout type="warning" title="هشدار">\nمحتوا\n</Callout>',
    );
  });

  it("converts all five types", () => {
    for (const type of ["danger", "info", "note", "tip", "warning"]) {
      expect(convertAdmonitions(`:::${type}\nx\n:::`)).toContain(
        `type="${type}"`,
      );
    }
  });

  it("maps caution to warning", () => {
    expect(convertAdmonitions(":::caution\nx\n:::")).toContain('type="warning"');
  });

  it("does not touch ::: inside a fenced code block", () => {
    const input = "```md\n:::tip\nنمونه\n:::\n```";
    expect(convertAdmonitions(input)).toBe(input);
  });

  it("converts two consecutive admonitions", () => {
    const input = ":::tip\nیک\n:::\n\n:::info\nدو\n:::";
    const out = convertAdmonitions(input);
    expect(out).toContain('<Callout type="tip">');
    expect(out).toContain('<Callout type="info">');
    expect(out).not.toContain(":::");
  });

  it("escapes double quotes in a title", () => {
    const out = convertAdmonitions(':::tip عنوان "خاص"\nx\n:::');
    expect(out).toContain('title="عنوان &quot;خاص&quot;"');
  });

  it("leaves an unclosed admonition marker alone rather than corrupting text", () => {
    const input = "متن عادی\n::: چیزی\nادامه";
    expect(convertAdmonitions(input)).toBe(input);
  });
});

describe("normalizeTag", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeTag("  Quantum   Computing  ")).toBe("Quantum Computing");
  });
  it("preserves original casing of the display form", () => {
    expect(normalizeTag("DevOps")).toBe("DevOps");
  });
});

describe("buildTagMap", () => {
  it("maps Arabic-yeh variants to a single canonical tag", () => {
    const map = buildTagMap(["برنامه‌نويسی", "برنامه‌نویسی", "برنامه‌نویسی"]);
    expect(map.get("برنامه‌نويسی")).toBe(map.get("برنامه‌نویسی"));
  });

  it("picks the most frequent variant as canonical", () => {
    const map = buildTagMap(["DevOps", "devops", "devops"]);
    expect(map.get("DevOps")).toBe("devops");
  });

  it("leaves genuinely distinct tags alone", () => {
    const map = buildTagMap(["Go", "Rust"]);
    expect(map.get("Go")).toBe("Go");
    expect(map.get("Rust")).toBe("Rust");
  });

  it("is deterministic when counts tie", () => {
    const a = buildTagMap(["Alpha", "alpha"]);
    const b = buildTagMap(["alpha", "Alpha"]);
    expect(a.get("Alpha")).toBe(b.get("Alpha"));
  });
});

describe("parseOrderFromDirname", () => {
  it("splits the NN- prefix into order and slug", () => {
    expect(parseOrderFromDirname("01-quantum")).toEqual({
      order: 1,
      slug: "quantum",
    });
  });
  it("handles a two-digit order", () => {
    expect(parseOrderFromDirname("17-firmware")).toEqual({
      order: 17,
      slug: "firmware",
    });
  });
  it("handles a missing prefix", () => {
    expect(parseOrderFromDirname("intro")).toEqual({ order: 0, slug: "intro" });
  });
  it("keeps hyphens inside the slug", () => {
    expect(parseOrderFromDirname("05-distributed-systems")).toEqual({
      order: 5,
      slug: "distributed-systems",
    });
  });
});

describe("rewriteImagePaths", () => {
  it("normalizes bare img/ markdown paths to ./img/", () => {
    expect(rewriteImagePaths("![x](img/1.png)")).toBe("![x](./img/1.png)");
  });
  it("leaves ./img/ paths unchanged", () => {
    expect(rewriteImagePaths("![x](./img/1.png)")).toBe("![x](./img/1.png)");
  });
  it("leaves absolute paths unchanged", () => {
    expect(rewriteImagePaths("![x](/img/1.png)")).toBe("![x](/img/1.png)");
  });
});

describe("findUnknownJsxTags", () => {
  it("reports a tag that is not in the known set", () => {
    const found = findUnknownJsxTags("<Mystery />", new Set(["Tooltip"]));
    expect(found).toContain("Mystery");
  });
  it("ignores known tags", () => {
    expect(findUnknownJsxTags("<Tooltip tip='x'>y</Tooltip>", new Set(["Tooltip"]))).toEqual([]);
  });
  it("ignores lowercase html tags", () => {
    expect(findUnknownJsxTags("<span>x</span>", new Set())).toEqual([]);
  });
  it("ignores tags inside fenced code", () => {
    expect(findUnknownJsxTags("```jsx\n<Mystery />\n```", new Set())).toEqual([]);
  });
});
