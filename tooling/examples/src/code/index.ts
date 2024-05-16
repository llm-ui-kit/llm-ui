import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  markdownDependencies,
  markdownDevDependencies,
  setupMarkdownTailwindCssNext,
} from "../markdown";
import { folderToExampleName } from "../shared/folderToExampleName";
import { setupNextjs } from "../shared/nextjs";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolder = "code/nextjs";
const exampleName = folderToExampleName(exampleFolder);

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolder);
  const dependencies = [
    ...markdownDependencies(llmUiVersion),
    "html-react-parser",
    "shiki@^1.5.2",
    `@llm-ui/code@${llmUiVersion}`,
  ];
  await setupNextjs({
    folder,
    exampleName,
    dependencies,
    devDependencies: markdownDevDependencies,
    exampleFolder,
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

  await setupMarkdownTailwindCssNext(folder);
};

export const codeNextJs: Example = {
  folder: exampleFolder,
  exampleName,
  description: "Code block example (Next.js)",
  generate: nextjs,
};
