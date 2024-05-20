import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { markdownDependencies, markdownDevDependencies } from "../markdown";
import { folderToExampleName } from "../shared/folderToExampleName";
import { setupNextjs } from "../shared/nextjs";
import { setupVite } from "../shared/vite";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolderNextJs = "buttons/nextjs";
const exampleNameNextJs = folderToExampleName(exampleFolderNextJs);
const exampleDescriptionNextJs = "Buttons example (Next.js)";

const exampleFolderVite = "buttons/vite";
const exampleNameVite = folderToExampleName(exampleFolderVite);
const exampleDescriptionVite = "Buttons example (Vite)";

const getDependencies = (llmUiVersion: string) => [
  ...markdownDependencies(llmUiVersion),
  `@llm-ui/buttons@${llmUiVersion}`,
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
    path.join(__dirname, "buttonsExample.ts.hbs"),
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
    path.join(__dirname, "buttonsExample.ts.hbs"),
    path.join(folder, "src/App.tsx"),
  );
};

export const buttonsNextJs: Example = {
  folder: exampleFolderNextJs,
  exampleName: exampleNameNextJs,
  exampleDescription: exampleDescriptionNextJs,
  generate: nextjs,
};

export const buttonsVite: Example = {
  folder: exampleFolderVite,
  exampleName: exampleNameVite,
  exampleDescription: exampleDescriptionVite,
  generate: vite,
};
