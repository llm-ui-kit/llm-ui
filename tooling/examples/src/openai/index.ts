import fs from "fs/promises";
import path from "path";
import replace from "replace-in-file";
import { fileURLToPath } from "url";
import { markdownDependencies, markdownDevDependencies } from "../markdown";
import { folderToExampleName } from "../shared/folderToExampleName";
import { setupNextjs } from "../shared/nextjs";
import { setupVite } from "../shared/vite";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolderNextJs = "openai/nextjs";
const exampleNameNextJs = folderToExampleName(exampleFolderNextJs);
const exampleDescriptionNextJs = "OpenAI example (Next.js)";

const exampleFolderVite = "openai/vite-and-express";
const exampleNameVite = folderToExampleName(exampleFolderVite);
const exampleDescriptionVite = "OpenAI example (Vite + Express)";

const getDependencies = (llmUiVersion: string) => [
  ...markdownDependencies(llmUiVersion),
  "html-react-parser",
  "shiki@^1.5.2",
  `@llm-ui/code@${llmUiVersion}`,
  "openai",
];

export const openaiDotEnv = async (folder: string) => {
  await fs.copyFile(
    path.join(__dirname, ".env.example.hbs"),
    path.join(folder, ".env.example"),
  );
};

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolderNextJs);
  const dependencies = getDependencies(llmUiVersion);
  await setupNextjs({
    folder,
    exampleName: exampleNameNextJs,
    exampleDescription: exampleDescriptionNextJs,
    dependencies,
    devDependencies: markdownDevDependencies,
    exampleFolder: exampleFolderNextJs,
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

  await fs.mkdir(path.join(folder, "src/app/api/openai"), { recursive: true });

  await fs.copyFile(
    path.join(__dirname, "route.ts.hbs"),
    path.join(folder, "src/app/api/openai/route.ts"),
  );

  await fs.copyFile(
    path.join(__dirname, "constants.ts.hbs"),
    path.join(folder, "src/app/constants.ts"),
  );

  await openaiDotEnv(folder);
};

const vite = async ({
  examplesFolder,
  llmUiVersion,
  viteVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolderVite);
  const dependencies = [...getDependencies(llmUiVersion), "dotenv"];

  await setupVite({
    folder,
    exampleName: exampleNameVite,
    exampleDescription: exampleDescriptionVite,
    dependencies,
    devDependencies: markdownDevDependencies,
    exampleFolder: exampleFolderVite,
    viteVersion,
    withExpress: true,
  });

  await fs.copyFile(
    path.join(__dirname, "example.tsx.hbs"),
    path.join(folder, "src/App.tsx"),
  );

  await fs.copyFile(
    path.join(__dirname, "constants.ts.hbs"),
    path.join(folder, "src/constants.ts"),
  );

  await fs.copyFile(
    path.join(__dirname, ".env.example.hbs"),
    path.join(folder, ".env.example"),
  );

  await replace({
    files: [path.join(folder, "src/server.ts")],
    from: `import ViteExpress from "vite-express";`,
    to: `import ViteExpress from "vite-express";\n\n${await fs.readFile(path.join(__dirname, "express.ts.hbs"))}`,
  });
};

export const openaiNextJs: Example = {
  folder: exampleFolderNextJs,
  exampleName: exampleNameNextJs,
  exampleDescription: exampleDescriptionNextJs,
  generate: nextjs,
};

export const openaiVite: Example = {
  folder: exampleFolderVite,
  exampleName: exampleNameVite,
  exampleDescription: exampleDescriptionVite,
  generate: vite,
};
