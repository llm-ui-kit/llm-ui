import fg from "fast-glob";
import fs from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const packageNameArg = process.argv[2];

if (!packageNameArg) {
  console.error("Please provide a package name");
  process.exit(1);
}
if (packageNameArg.startsWith("@llm-ui/")) {
  console.error("Please provide a package name without the @llm-ui/ prefix");
  process.exit(1);
}

const folderName = packageNameArg;
const packageName = packageNameArg.startsWith("@llm-ui/")
  ? packageNameArg
  : `@llm-ui/${packageNameArg}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pattern = `${__dirname}/../packageTemplate/**/*`;
const files = await fg(pattern, { dot: true });

const targetDir = path.join(__dirname, "../../../packages", folderName);
if (fs.existsSync(targetDir)) {
  console.error(`Package ${packageName} already exists`);
  process.exit(1);
}
await mkdir(targetDir, { recursive: true });

const transformAndWriteFile = async (filePath: string) => {
  try {
    const fileContent = await readFile(filePath, "utf8");
    const template = Handlebars.compile(fileContent);
    const result = template({ packageName, folderName });

    const newFilePath = filePath
      .replace(/.*\/packageTemplate/, targetDir)
      .replace(/\.hbs$/, "");
    const newDirPath = dirname(newFilePath);
    await mkdir(newDirPath, { recursive: true });
    await writeFile(newFilePath, result, "utf8");
    console.log(`Create: ${newFilePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}: `, error);
  }
};

for (const file of files) {
  await transformAndWriteFile(file);
}

console.log(`Package ${packageName} has been successfully created.`);
