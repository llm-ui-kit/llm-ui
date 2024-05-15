import fs from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import tar from "tar";

export type RepoInfo = {
  username: string;
  name: string;
  branch: string;
  filePath: string;
};

const downloadTarStream = async (url: string) => {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error(`Failed to download: ${url}`);
  }

  return Readable.fromWeb(res.body as import("stream/web").ReadableStream);
};

export const downloadAndExtractExample = async (
  folder: string,
  repoFolder: string,
) => {
  if (fs.existsSync(folder)) {
    console.error(`The folder ${folder} already exists, please delete it.`);
    process.exit(1);
  }

  fs.mkdirSync(folder, { recursive: true });

  await pipeline(
    await downloadTarStream(
      "https://codeload.github.com/llm-ui-kit/llm-ui/tar.gz/main",
    ),
    tar.x({
      cwd: folder,
      strip: 2 + repoFolder.split("/").length,
      filter: (p) => p.includes(`llm-ui-main/examples/${repoFolder}/`),
    }),
  );
};
