#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import * as path from "path";
import { downloadAndExtractExample } from "./download";
import { install } from "./install";
import { getPackageManager } from "./packageManager";

const program = new Command();

const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

program
  .name("create-llm-ui")
  .description("CLI for llm-ui")
  .version(packageJson.version);

program
  .command("example <exampleName> <folder>")
  .description(
    "Handle the example command with an example name and folder argument",
  )
  .action(async (exampleName: string, folder: string) => {
    const resolvedPath = path.resolve(folder);
    console.log(`Setting up ${exampleName} in folder: ${resolvedPath}`);
    await downloadAndExtractExample(folder, exampleName);

    await install(getPackageManager(), folder);
    const dotEnv = path.join(folder, ".env.example");

    const isDotEnv = fs.existsSync(dotEnv);
    if (isDotEnv) {
      fs.renameSync(dotEnv, path.join(folder, ".env"));
    }

    const dotEnvInstructions = isDotEnv
      ? "\n\nPlease set the environment variables in .env"
      : "";

    console.log(
      `To start the example:\n\ncd ${folder}${dotEnvInstructions}\n\n${getPackageManager()} run dev`,
    );
  });

program.parse(process.argv);
