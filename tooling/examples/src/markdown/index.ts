import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { setupNextjs } from "../shared/nextjs";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const devDependencies = ["@tailwindcss/typography"];

const appendToFile = async (filePath: string, content: string) => {
  const fileContent = await fs.readFile(filePath, "utf8");
  const newContents = `${fileContent}\n${content}`;
  await fs.writeFile(filePath, newContents);
};

const nextjs = async ({ repoRoot, llmUiVersion }: CommonParams) => {
  const examplesFolder = path.join(repoRoot, "/examples");
  const dependencies = [
    `@llm-ui/react@${llmUiVersion}`,
    `@llm-ui/markdown@${llmUiVersion}`,
    "react-markdown",
    "remark-gfm",
  ];

  const exampleFolder = "nextjstest/markdown";
  const folder = path.join(examplesFolder, exampleFolder);

  await setupNextjs({
    folder,
    exampleName: `llm-ui-${exampleFolder.split("/").join("-")}-example`,
    dependencies,
    devDependencies,
    exampleFolder,
  });

  await fs.copyFile(
    path.join(__dirname, "markdownExample.ts.hbs"),
    path.join(folder, "src/app/page.tsx"),
  );

  const taiwindMarkdownCss = await fs.readFile(
    path.join(__dirname, "tailwindMarkdown.css.hbs"),
    "utf8",
  );

  await appendToFile(
    path.join(folder, "src/app/globals.css"),
    taiwindMarkdownCss,
  );
};

export const markdownNextJs: Example = {
  folder: "markdown/nextjs",
  exampleName: "llm-ui-markdown-nextjs-example",
  generate: nextjs,
};
