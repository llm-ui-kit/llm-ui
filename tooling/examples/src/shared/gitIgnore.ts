import path from "path";
import { appendToFile } from "./appendToFile";

export const setupGitIgnore = async (folder: string) => {
  const gitIgnoreFile = path.join(folder, ".gitignore");
  await appendToFile(gitIgnoreFile, "\n.env\n");
};
