import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
} as const;

export const PlayIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
  </svg>
);

export const PauseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="6" y="4.5" width="4.2" height="15" rx="1.4" />
    <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4" />
  </svg>
);

/** Circular arrow with the skip length inside; `flip` mirrors it for rewind. */
export function SkipIcon({
  seconds,
  flip,
  ...p
}: IconProps & { seconds: number; flip?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden {...p}>
      <g transform={flip ? "translate(48 0) scale(-1 1)" : undefined}>
        <path
          d="M24 10A14 14 0 1 1 10.5 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M24 4v12l-8-6Z" fill="currentColor" />
      </g>
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        fontFamily="ui-monospace, monospace"
      >
        {seconds}
      </text>
    </svg>
  );
}

export const ReplayIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5V2L7 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8Z" />
  </svg>
);
