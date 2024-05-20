import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { folderToExampleName } from "../shared/folderToExampleName";
import { setupNextjs } from "../shared/nextjs";
import { setupVite } from "../shared/vite";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolderNextJs = "markdown/nextjs";
const exampleNameNextJs = folderToExampleName(exampleFolderNextJs);
const exampleDescriptionNextjs = "Markdown example (Next.js)";

const exampleFolderVite = "markdown/vite";
const exampleNameVite = folderToExampleName(exampleFolderVite);
const exampleDescriptionVite = "Markdown example (Vite)";

export const markdownDependencies = (llmUiVersion: string) => [
  `@llm-ui/react@${llmUiVersion}`,
  `@llm-ui/markdown@${llmUiVersion}`,
  "react-markdown",
  "remark-gfm",
];

export const markdownDevDependencies = ["@tailwindcss/typography"];

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolderNextJs);

  await setupNextjs({
    folder,
    exampleName: exampleNameNextJs,
    exampleDescription: exampleDescriptionNextjs,
    dependencies: markdownDependencies(llmUiVersion),
    devDependencies: markdownDevDependencies,
    exampleFolder: exampleFolderNextJs,
    nextjsVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "markdownExample.ts.hbs"),
    path.join(folder, "src/app/page.tsx"),
  );
};

const vite = async ({
  examplesFolder,
  llmUiVersion,
  viteVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolderVite);

  await setupVite({
    folder,
    exampleName: exampleNameVite,
    exampleDescription: exampleDescriptionNextjs,
    dependencies: markdownDependencies(llmUiVersion),
    devDependencies: markdownDevDependencies,
    exampleFolder: exampleFolderVite,
    viteVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "markdownExample.ts.hbs"),
    path.join(folder, "src/App.tsx"),
  );
};

export const markdownNextJs: Example = {
  folder: exampleFolderNextJs,
  exampleName: exampleNameNextJs,
  exampleDescription: exampleDescriptionNextjs,
  generate: nextjs,
};

export const markdownVite: Example = {
  folder: exampleFolderVite,
  exampleName: exampleNameVite,
  exampleDescription: exampleDescriptionVite,
  generate: vite,
};
