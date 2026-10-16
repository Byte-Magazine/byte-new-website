import type { ReactNode } from "react";

import { accentStyleTag, BRAND_ACCENT_FALLBACK } from "@/lib/brand-color";

/**
 * ByteCast keeps the site's base blue. The root layout tints everything with
 * the newest issue's colour; this later rule puts the neutral brand accent
 * back for the podcast pages (it is removed again when leaving them).
 */
export default function BytecastLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: accentStyleTag(BRAND_ACCENT_FALLBACK),
        }}
      />
      {children}
    </>
  );
}
