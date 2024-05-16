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

const exampleFolder = "openai/nextjs";
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
    "openai",
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
    path.join(__dirname, "../code/page.tsx.hbs"),
    path.join(folder, "src/app/page.tsx"),
  );
  await fs.mkdir(path.join(folder, "src/app/api"));
  await fs.copyFile(
    path.join(__dirname, "route.ts.hbs"),
    path.join(folder, "src/app/api/route.ts"),
  );
  await fs.copyFile(
    path.join(__dirname, "constants.ts.hbs"),
    path.join(folder, "src/constants.ts"),
  );
  await fs.copyFile(
    path.join(__dirname, ".env.example.hbs"),
    path.join(folder, ".env.example"),
  );

  await setupMarkdownTailwindCssNext(folder);
};

export const openaiNextJs: Example = {
  folder: exampleFolder,
  exampleName,
  generate: nextjs,
};
