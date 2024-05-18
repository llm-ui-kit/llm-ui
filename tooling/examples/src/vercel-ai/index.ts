import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getCodeDependencies, nextjsShared } from "../code";
import { openaiDotEnv } from "../openai";
import { folderToExampleName } from "../shared/folderToExampleName";
import { CommonParams, Example } from "../types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exampleFolderVercelAi = "vercel-ai/nextjs";
const exampleNameVercelAi = folderToExampleName(exampleFolderVercelAi);
const exampleDescriptionVercelAi = "vercel.ai (Next.js)";

const nextjs = async ({
  examplesFolder,
  llmUiVersion,
  nextjsVersion,
}: CommonParams) => {
  const folder = path.join(examplesFolder, exampleFolderVercelAi);

  const dependencies = [
    ...getCodeDependencies(llmUiVersion),
    "ai",
    "@ai-sdk/openai",
    "zod",
  ];

  await nextjsShared({
    exampleName: exampleNameVercelAi,
    exampleDescription: exampleDescriptionVercelAi,
    examplesFolder,
    nextjsVersion,
    dependencies,
    relativeFolder: exampleFolderVercelAi,
  });
  await fs.mkdir(path.join(folder, "src/app/api/chat"), { recursive: true });

  await fs.copyFile(
    path.join(__dirname, "route.ts.hbs"),
    path.join(folder, "src/app/api/chat/route.ts"),
  );

  await fs.copyFile(
    path.join(__dirname, "example.tsx.hbs"),
    path.join(folder, "src/app/example.tsx"),
  );

  await openaiDotEnv(folder);
};

export const vercelAiNextJs: Example = {
  folder: exampleFolderVercelAi,
  exampleName: exampleNameVercelAi,
  exampleDescription: exampleDescriptionVercelAi,
  generate: nextjs,
};
