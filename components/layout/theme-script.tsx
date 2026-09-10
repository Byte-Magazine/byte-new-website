import { THEME_STORAGE_KEY } from "@/lib/stores/theme";

/**
 * Applies the stored theme before the first paint.
 *
 * Must render as a blocking script at the very top of <head>: if it runs after
 * the stylesheet, the browser paints the default theme first and the page
 * visibly flashes on every refresh.
 *
 * It reads the same key the zustand `persist` middleware writes, so the two
 * never disagree. persist stores `{ "state": { "theme": ... }, "version": n }`.
 */
const script = `
(function () {
  try {
    var root = document.documentElement;
    var query = window.matchMedia("(prefers-color-scheme: dark)");

    var read = function () {
      try {
        var raw = localStorage.getItem("${THEME_STORAGE_KEY}");
        if (!raw) return "system";
        var parsed = JSON.parse(raw);
        var theme = parsed && parsed.state && parsed.state.theme;
        return theme === "light" || theme === "dark" ? theme : "system";
      } catch (e) {
        return "system";
      }
    };

    var apply = function () {
      var theme = read();
      var dark = theme === "dark" || (theme === "system" && query.matches);
      // Both classes are explicit so a chosen theme overrides the
      // prefers-color-scheme defaults in the stylesheet.
      root.classList.toggle("dark", theme === "dark");
      root.classList.toggle("light", theme === "light");
      root.style.colorScheme = dark ? "dark" : "light";
    };

    apply();
    query.addEventListener("change", apply);
  } catch (e) {}
})();
`;

export function ThemeScript() {
  // No `id` and no `strategy`: React hoists and dedupes identified scripts,
  // which moves this out of the head and reintroduces the flash. A plain
  // inline script stays exactly where it is rendered.
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
