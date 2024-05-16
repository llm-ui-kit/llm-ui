import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { appendToFile } from "../shared/appendToFile";
import { folderToExampleName } from "../shared/folderToExampleName";
import { setupNextjs } from "../shared/nextjs";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolder = "markdown/nextjs";
const exampleName = folderToExampleName(exampleFolder);

export const markdownDependencies = (llmUiVersion: string) => [
  `@llm-ui/react@${llmUiVersion}`,
  `@llm-ui/markdown@${llmUiVersion}`,
  "react-markdown",
  "remark-gfm",
];

export const markdownDevDependencies = ["@tailwindcss/typography"];

export const setupMarkdownTailwindCss = async (cssFilePath: string) => {
  const taiwindMarkdownCss = await fs.readFile(
    path.join(__dirname, "tailwindMarkdown.css.hbs"),
    "utf8",
  );

  await appendToFile(cssFilePath, taiwindMarkdownCss);
};

export const setupMarkdownTailwindCssNext = (folder: string) => {
  return setupMarkdownTailwindCss(path.join(folder, "src/app/globals.css"));
};

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolder);

  await setupNextjs({
    folder,
    exampleName,
    dependencies: markdownDependencies(llmUiVersion),
    devDependencies: markdownDevDependencies,
    exampleFolder,
    nextjsVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "markdownExample.ts.hbs"),
    path.join(folder, "src/app/page.tsx"),
  );
  await setupMarkdownTailwindCssNext(folder);
};

export const markdownNextJs: Example = {
  folder: exampleFolder,
  exampleName,
  generate: nextjs,
};
