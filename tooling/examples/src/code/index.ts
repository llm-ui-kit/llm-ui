import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { markdownDependencies, markdownDevDependencies } from "../markdown";
import { folderToExampleName } from "../shared/folderToExampleName";
import { setupNextjs } from "../shared/nextjs";
import { setupVite } from "../shared/vite";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolderNextJs = "code/nextjs";
const exampleNameNextJs = folderToExampleName(exampleFolderNextJs);
const exampleDescriptionNextJs = "Code block example (Next.js)";

const exampleFolderVite = "code/vite";
const exampleNameVite = folderToExampleName(exampleFolderVite);
const exampleDescriptionVite = "Code block example (Vite)";

export const getCodeDependencies = (llmUiVersion: string) => [
  ...markdownDependencies(llmUiVersion),
  "html-react-parser",
  "shiki@^1.5.2",
  `@llm-ui/code@${llmUiVersion}`,
];

export const nextjsShared = async ({
  examplesFolder,
  nextjsVersion,
  dependencies,
  relativeFolder,
  exampleName,
  exampleDescription,
}: Pick<CommonParams, "examplesFolder" | "nextjsVersion"> & {
  exampleName: string;
  exampleDescription: string;
  dependencies: string[];
  relativeFolder: string;
}) => {
  const folder = path.join(examplesFolder, relativeFolder);
  await setupNextjs({
    folder,
    exampleName,
    exampleDescription,
    dependencies,
    devDependencies: markdownDevDependencies,
    exampleFolder: relativeFolder,
    nextjsVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "example.tsx.hbs"),
    path.join(folder, "src/app/example.tsx"),
  );
  await fs.copyFile(
    path.join(__dirname, "page.tsx.hbs"),
    path.join(folder, "src/app/page.tsx"),
  );
};

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const dependencies = getCodeDependencies(llmUiVersion);
  await nextjsShared({
    exampleName: exampleNameNextJs,
    exampleDescription: exampleDescriptionNextJs,
    examplesFolder,
    nextjsVersion,
    dependencies,
    relativeFolder: exampleFolderNextJs,
  });
};

const vite = async ({
  examplesFolder,
  llmUiVersion,
  viteVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolderVite);
  const dependencies = getCodeDependencies(llmUiVersion);
  await setupVite({
    folder,
    exampleName: exampleNameVite,
    exampleDescription: exampleDescriptionVite,
    dependencies,
    devDependencies: markdownDevDependencies,
    exampleFolder: exampleFolderVite,
    viteVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "example.tsx.hbs"),
    path.join(folder, "src/App.tsx"),
  );
};

export const codeNextJs: Example = {
  folder: exampleFolderNextJs,
  exampleName: exampleNameNextJs,
  exampleDescription: exampleDescriptionNextJs,
  generate: nextjs,
};

export const codeVite: Example = {
  folder: exampleFolderVite,
  exampleName: exampleNameVite,
  exampleDescription: exampleDescriptionVite,
  generate: vite,
};
