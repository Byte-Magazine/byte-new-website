import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

/**
 * Vazirmatn carries all Persian text: body, UI, and display. Hierarchy comes
 * from weight and size rather than a second family, which keeps the page
 * coherent and avoids a second webfont download.
 */
export const vazirmatn = localFont({
  src: "../public/fonts/Vazirmatn.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
  weight: "100 900",
  fallback: ["Tahoma", "system-ui", "sans-serif"],
});

/**
 * Reserved for code and for the binary issue numbers, which are the
 * publication's identity. Latin subset only, so Persian never falls into it.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = `${vazirmatn.variable} ${jetbrainsMono.variable}`;
