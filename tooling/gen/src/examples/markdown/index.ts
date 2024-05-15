import fs from "fs/promises";
import path from "path";
import { setupNextjs } from "../shared/nextjs";

const examplesFolder = path.join(process.cwd(), "../../", "/examples");
const llmUiVersion = "0.1.1";
const dependencies = [
  `@llm-ui/react@${llmUiVersion}`,
  `@llm-ui/markdown@${llmUiVersion}`,
  "react-markdown",
  "remark-gfm",
];
const devDependencies = ["@tailwindcss/typography"];

const appendToFile = async (filePath: string, content: string) => {
  const fileContent = await fs.readFile(filePath, "utf8");
  const newContents = `${fileContent}\n${content}`;
  await fs.writeFile(filePath, newContents);
};

export const nextjs = async () => {
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
    path.join(process.cwd(), "src/examples/markdown/markdownExample.ts.hbs"),
    path.join(folder, "src/app/page.tsx"),
  );

  const taiwindMarkdownCss = await fs.readFile(
    path.join(process.cwd(), "src/examples/markdown/tailwindMarkdown.css.hbs"),
    "utf8",
  );

  await appendToFile(
    path.join(folder, "src/app/globals.css"),
    taiwindMarkdownCss,
  );
};
