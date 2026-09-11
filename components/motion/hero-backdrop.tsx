"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { useThemeStore } from "@/lib/stores/theme";
import type { GrainientPalette } from "@/lib/brand-color";

const Grainient = dynamic(() => import("./grainient"), { ssr: false });
const DotGrid = dynamic(() => import("./dot-grid"), { ssr: false });

/**
 * The hero backdrop: a slow grainy gradient in the site's own accent.
 *
 * Two layers, deliberately not one:
 *
 *   · A CSS foundation that always paints — a soft pool of accent behind the
 *     cover plus a scrim that protects contrast under the headline. Pure
 *     gradients, so it cannot fail.
 *   · The Grainient field on top. It needs WebGL, so it is loaded only on a
 *     wide viewport, only when motion is welcome, and never during SSR. If the
 *     GL context is refused the hero still reads as designed.
 *
 * The palette comes from the newest issue, so the backdrop changes colour with
 * each release rather than being a fixed decoration.
 */
export function HeroBackdrop({ palette }: { palette: GrainientPalette }) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(wide.matches && !still.matches);

    sync();
    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  const light = resolvedTheme === "light";
  const neutral = light ? palette.neutralLight : palette.neutralDark;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Foundation: always painted, so the hero never depends on WebGL. */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(90% 70% at 78% 0%, ${palette.accent}22, transparent 70%)`,
        }}
      />

      {enabled ? (
        <div className="absolute inset-0 opacity-[0.55] mix-blend-soft-light dark:opacity-40">
          <Grainient
            color1={neutral}
            color2={palette.accent}
            color3={neutral}
            lightMode={light}
            timeSpeed={0.12}
            warpStrength={0.7}
            grainAmount={0.07}
            blendSoftness={0.85}
            saturation={0.9}
            className="size-full"
          />
        </div>
      ) : null}

      {/*
        A field of dots that reacts to the pointer, replacing the flat CSS
        grid. Rendered before the scrim so the scrim softens it rather than
        erasing it. It reads as a substrate rather than graph paper, and the
        interaction rewards a visitor who moves across the hero.
      */}
      {enabled ? (
        <div className="pointer-events-auto absolute inset-0 [mask-image:radial-gradient(130%_100%_at_65%_5%,black,transparent_78%)]">
          <DotGrid
            dotSize={2.5}
            gap={28}
            baseColor={light ? "#c4c9d6" : "#3a4152"}
            activeColor={palette.accent}
            proximity={110}
            shockRadius={190}
            shockStrength={4}
            returnDuration={1.3}
            className="size-full"
          />
        </div>
      ) : null}

      {/* Scrim last: keeps the headline legible over whatever moves beneath. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-background" />
    </div>
  );
}
