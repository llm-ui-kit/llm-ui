import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { markdownDependencies, markdownDevDependencies } from "../markdown";
import { folderToExampleName } from "../shared/folderToExampleName";
import { setupNextjs } from "../shared/nextjs";
import { setupVite } from "../shared/vite";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolderNextJs = "custom/nextjs";
const exampleNameNextJs = folderToExampleName(exampleFolderNextJs);
const exampleDescriptionNextJs = "Custom block example (Next.js)";

const exampleFolderVite = "custom/vite";
const exampleNameVite = folderToExampleName(exampleFolderVite);
const exampleDescriptionVite = "Custom block example (Vite)";

const getDependencies = (llmUiVersion: string) => [
  ...markdownDependencies(llmUiVersion),
  "zod",
  // `@llm-ui/custom@${llmUiVersion}`,
  `@llm-ui/custom@0.0.0-alpha.v5b6cf098f5d684c05baeb1dce6691c66356900c7`,
];

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolderNextJs);

  await setupNextjs({
    folder,
    exampleName: exampleNameNextJs,
    exampleDescription: exampleDescriptionNextJs,
    dependencies: getDependencies(llmUiVersion),
    devDependencies: markdownDevDependencies,
    exampleFolder: exampleFolderNextJs,
    nextjsVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "customExample.ts.hbs"),
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
    exampleDescription: exampleDescriptionVite,
    dependencies: getDependencies(llmUiVersion),
    devDependencies: markdownDevDependencies,
    exampleFolder: exampleFolderVite,
    viteVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "customExample.ts.hbs"),
    path.join(folder, "src/App.tsx"),
  );
};

export const customNextJs: Example = {
  folder: exampleFolderNextJs,
  exampleName: exampleNameNextJs,
  exampleDescription: exampleDescriptionNextJs,
  generate: nextjs,
};

export const customVite: Example = {
  folder: exampleFolderVite,
  exampleName: exampleNameVite,
  exampleDescription: exampleDescriptionVite,
  generate: vite,
};
