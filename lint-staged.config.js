module.exports = {
  "{apps,packages,tooling}/**/*.{cjs,mjs,js,ts,jsx,tsx,json,yaml,yml,astro,css}":
    [
      (files) => `pnpm exec eslint ${files.join(" ")}`,
      (files) =>
        `pnpm exec prettier --config .prettierrc.precommit.mjs --write ${files.join(" ")}`,
    ],
};
