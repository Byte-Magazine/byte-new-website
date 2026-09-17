"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a mermaid diagram. The library is loaded lazily so it only enters
 * the bundle on pages that actually contain a diagram.
 *
 * Forced `dir="ltr"` — the site is RTL, but flowchart layout/labels are LTR
 * and inherit broken mirroring without this.
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(false);

    void (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: dark ? "dark" : "neutral",
          fontFamily: "var(--font-sans)",
          securityLevel: "strict",
          flowchart: { htmlLabels: true, useMaxWidth: true },
        });
        const { svg } = await mermaid.render(
          `mermaid-${id}-${dark ? "dark" : "light"}`,
          chart,
        );
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.removeAttribute("height");
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id, dark]);

  if (error) {
    return (
      <pre className="scroll-subtle my-6 overflow-x-auto" dir="ltr">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      dir="ltr"
      className="mermaid-diagram scroll-subtle my-6 flex justify-center overflow-x-auto"
    />
  );
}

export default Mermaid;
