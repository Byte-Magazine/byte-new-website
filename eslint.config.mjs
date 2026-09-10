import next from "eslint-config-next";

const config = [
  ...next,
  {
    // Vendored from the React Bits registry; kept as shipped so it can be
    // re-fetched cleanly. Our own motion components sit alongside it.
    files: ["components/motion/decrypted-text.tsx", "components/ui/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    ignores: [
      "out/**",
      ".next/**",
      "content/**",
      "public/**",
      "node_modules/**",
      "shot.mjs",
    ],
  },
];

export default config;
