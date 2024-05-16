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

const exampleFolder = "buttons/nextjs";
const exampleName = folderToExampleName(exampleFolder);

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolder);

  await setupNextjs({
    folder,
    exampleName,
    dependencies: [
      ...markdownDependencies(llmUiVersion),
      `@llm-ui/buttons@${llmUiVersion}`,
    ],
    devDependencies: markdownDevDependencies,
    exampleFolder,
    nextjsVersion,
  });

  await fs.copyFile(
    path.join(__dirname, "buttonsExample.ts.hbs"),
    path.join(folder, "src/app/page.tsx"),
  );

  await setupMarkdownTailwindCssNext(folder);
};

export const buttonsNextJs: Example = {
  folder: exampleFolder,
  exampleName,
  description: "Buttons example (Next.js)",
  generate: nextjs,
};
