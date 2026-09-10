import localFont from "next/font/local";

/**
 * Pinar carries all Persian text: body, UI, and display. It is a variable
 * font, so hierarchy comes from the weight axis rather than a second family.
 */
export const pinar = localFont({
  src: "../public/fonts/Pinar-VF.woff2",
  variable: "--font-pinar",
  display: "swap",
  weight: "100 900",
  fallback: ["Tahoma", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

/**
 * Reserved for code and for the binary issue numbers that are the
 * publication's identity. Latin subset only, so Persian never falls into it.
 */
export const jetbrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-VF.woff2",
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: "400 700",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
  adjustFontFallback: false,
});

export const fontVariables = `${pinar.variable} ${jetbrainsMono.variable}`;
