import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";
import preferArrow from "eslint-plugin-prefer-arrow";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
const astroRecommended = eslintPluginAstro.configs["flat/recommended"];

const appWww = "apps/www";
const packageReact = "packages/react";

const reactProjects = [appWww, packageReact];
const reactProjectsGlob = `{${reactProjects.join(",")}}`;
const typescriptProjects = [...reactProjects];

export default [
  {
    ignores: [
      `${appWww}/{public,dist,.vercel,.astro}/**/*`,
      `${appWww}/src/components/Posthog.astro`,
    ],
  },
  ...typescriptProjects.map((project) => ({
    files: [`${project}/**/*.{ts,tsx}`],
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: `${project}/tsconfig.json`,
        sourceType: "module",
        ecmaVersion: 2020,
      },
    },
  })),
  {
    files: [`${reactProjectsGlob}/**/*.{jsx,tsx}`],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...reactRecommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: [`${reactProjectsGlob}/**/*.{js,jsx,mjs,cjs,ts,tsx}`],
    ...js.configs.recommended,
    plugins: {
      "prefer-arrow": preferArrow,
      ...js.configs.recommended.plugins,
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "React" }],
      "prefer-arrow-callback": "error",
      "prefer-arrow/prefer-arrow-functions": [
        "error",
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],
    },
  },
  {
    ...astroRecommended,
    files: [`${appWww}/**/*.{astro}`],
    rules: {
      ...astroRecommended.rules,
    },
  },
];
