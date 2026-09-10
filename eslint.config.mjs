import next from "eslint-config-next";

const config = [
  ...next,
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
