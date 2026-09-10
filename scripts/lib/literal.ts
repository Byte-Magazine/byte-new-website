/**
 * Parses the plain-data array literals in the legacy `src/data/*.ts` modules
 * without evaluating them.
 *
 * These files contain only object/array/string/number literals, so converting
 * JS literal syntax to JSON and using JSON.parse is both sufficient and avoids
 * executing repo content as code.
 */

/**
 * Extracts the balanced `[...]` literal that follows a marker in a source file.
 *
 * Scanning starts after the `=` when the declaration has one, so a type
 * annotation such as `const X: Item[] = [...]` does not match the empty
 * brackets of `Item[]`.
 */
export function extractArrayLiteral(source: string, marker: string): string {
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`marker not found: ${marker}`);

  const equals = source.indexOf("=", start);
  const lineEnd = source.indexOf("\n", start);
  const searchFrom =
    equals !== -1 && (lineEnd === -1 || equals < lineEnd) ? equals : start;

  const open = source.indexOf("[", searchFrom);
  if (open === -1) throw new Error(`no array literal after: ${marker}`);

  let depth = 0;
  let inString: string | null = null;

  for (let i = open; i < source.length; i++) {
    const char = source[i];

    if (inString) {
      if (char === "\\") i++;
      else if (char === inString) inString = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      continue;
    }
    if (char === "[") depth++;
    else if (char === "]") {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }

  throw new Error(`unbalanced array literal after: ${marker}`);
}

/** Converts a JS data literal into JSON text. */
export function literalToJson(literal: string): string {
  let out = "";
  let inString: string | null = null;

  for (let i = 0; i < literal.length; i++) {
    const char = literal[i];

    if (inString) {
      if (char === "\\") {
        out += char + literal[++i];
        continue;
      }
      if (char === inString) {
        inString = null;
        out += '"';
        continue;
      }
      // Escape a double quote that appeared inside a single-quoted string.
      out += char === '"' ? '\\"' : char;
      continue;
    }

    // Strip comments.
    if (char === "/" && literal[i + 1] === "/") {
      while (i < literal.length && literal[i] !== "\n") i++;
      continue;
    }
    if (char === "/" && literal[i + 1] === "*") {
      i += 2;
      while (i < literal.length && !(literal[i] === "*" && literal[i + 1] === "/")) i++;
      i++;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      out += '"';
      continue;
    }

    out += char;
  }

  return (
    out
      // Quote unquoted object keys.
      .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
      // Drop trailing commas.
      .replace(/,(\s*[}\]])/g, "$1")
  );
}

/** Parses a named array literal from legacy TypeScript source into data. */
export function parseArrayLiteral<T>(source: string, marker: string): T[] {
  return JSON.parse(literalToJson(extractArrayLiteral(source, marker))) as T[];
}
