"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a mermaid diagram. The library is loaded lazily and only on the two
 * pages that actually contain a diagram, so it never enters the common bundle.
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        const dark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          theme: dark ? "dark" : "neutral",
          fontFamily: "var(--font-sans)",
        });
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <pre className="scroll-subtle overflow-x-auto" dir="ltr">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="scroll-subtle my-6 flex justify-center overflow-x-auto"
    />
  );
}

export default Mermaid;
