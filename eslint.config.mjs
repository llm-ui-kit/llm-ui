import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";
import preferArrow from "eslint-plugin-prefer-arrow";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import fastGlob from "fast-glob";
import globals from "globals";
import { dirname } from "path";
import { fileURLToPath } from "url";

const astroRecommended = eslintPluginAstro.configs["flat/recommended"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appWww = "apps/www";

const packageReact = "packages/react";
const packageMarkdown = "packages/markdown";
const packageCodeBlocks = "packages/code";
const packageButtons = "packages/buttons";
const packageShared = "packages/shared";
const packageJson = "packages/json";
const packageCsv = "packages/csv";
const packageCli = "packages/create-llm-ui";

const toolingGen = "tooling/gen";
const toolingExamples = "tooling/examples";

const reactProjects = [
  appWww,
  packageReact,
  packageMarkdown,
  packageCodeBlocks,
  packageButtons,
  packageShared,
  packageJson,
  packageCsv,
];
const reactProjectsGlob = `{${reactProjects.join(",")}}`;
const typescriptProjects = [
  ...reactProjects,
  toolingGen,
  packageCli,
  toolingExamples,
];

const foldersToLint = fastGlob.sync([`apps/*`, `packages/*`, `tooling/*`], {
  onlyDirectories: true,
  ignore: ["tooling/tsconfig"],
});

const missingInConfig = foldersToLint.filter(
  (f) => !typescriptProjects.includes(f),
);

if (missingInConfig.length > 0) {
  throw new Error(`Missing in eslint config: ${missingInConfig.join(",")}`);
}

export default [
  {
    ignores: [
      `${appWww}/{public,dist,.vercel,.astro}/**/*`,
      `${appWww}/src/components/Posthog.astro`,
      `packages/*/dist/**/*`,
    ],
  },
  ...typescriptProjects.map((project) => ({
    files: [`${project}/**/*.{ts,tsx}`],
    plugins: {
      "@typescript-eslint": ts,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: `${project}/tsconfig.json`,
        sourceType: "module",
        ecmaVersion: 2020,
      },
    },
    rules: {
      ...ts.configs["eslint-recommended"].rules,
      ...ts.configs["recommended"].rules,
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
