import { describe, it, expect } from "vitest";
import {
  replaceHoverHandlers,
  rewriteAssetRequires,
  convertAdmonitionElements,
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

describe("stripSiteImports (theme imports)", () => {
  it("removes @theme imports", () => {
    const input = 'import Admonition from "@theme/Admonition";\n\nمتن';
    expect(stripSiteImports(input).trim()).toBe("متن");
  });
});

describe("convertAdmonitionElements", () => {
  it("rewrites an Admonition element to a Callout", () => {
    const out = convertAdmonitionElements('<Admonition type="info" icon="" title="">x</Admonition>');
    expect(out).toBe('<Callout type="info">x</Callout>');
  });
  it("keeps a non-empty title", () => {
    const out = convertAdmonitionElements('<Admonition type="tip" title="نکته">x</Admonition>');
    expect(out).toContain('title="نکته"');
  });
  it("defaults a missing type to note", () => {
    expect(convertAdmonitionElements("<Admonition>x</Admonition>")).toContain('type="note"');
  });
});

describe("findUnknownJsxTags (local definitions)", () => {
  it("ignores components the file defines itself", () => {
    const body = "export const Grid = ({children}) => <div>{children}</div>;\n\n<Grid>x</Grid>";
    expect(findUnknownJsxTags(body, new Set())).toEqual([]);
  });
});

describe("replaceHoverHandlers", () => {
  it("removes an onMouseEnter handler", () => {
    const input = `<a href={link} target="_blank" onMouseEnter={(e) => {\n  e.currentTarget.style.color = 'red';\n}}>x</a>`;
    const out = replaceHoverHandlers(input);
    expect(out).not.toContain("onMouseEnter");
  });

  it("tags the anchor with the link-card class", () => {
    const input = `<a href={link} target="_blank" onMouseLeave={(e) => {\n  e.currentTarget.style.color = '';\n}}>x</a>`;
    expect(replaceHoverHandlers(input)).toContain('className="link-card"');
  });

  it("leaves markup without handlers untouched", () => {
    const input = '<a href="/x">y</a>';
    expect(replaceHoverHandlers(input)).toBe(input);
  });
});

describe("rewriteAssetRequires", () => {
  const base = "/content/issues/00000111/sites-and-channels";

  it("rewrites a template-literal require to a path", () => {
    const out = rewriteAssetRequires(
      "require(`./icons/${icon}`).default",
      base,
    );
    expect(out).toBe("`" + base + "/icons/${icon}`");
  });

  it("rewrites a plain string require", () => {
    expect(rewriteAssetRequires('require("./img/a.png")', base)).toBe(
      "`" + base + "/img/a.png`",
    );
  });

  it("leaves unrelated code untouched", () => {
    expect(rewriteAssetRequires("const x = 1;", base)).toBe("const x = 1;");
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
