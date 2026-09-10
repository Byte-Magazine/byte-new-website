import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

// Required for output: "export" — the route is generated once at build time.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    lang: "fa",
    dir: "rtl",
    background_color: "#12151c",
    theme_color: "#12151c",
    icons: [{ src: "/img/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
