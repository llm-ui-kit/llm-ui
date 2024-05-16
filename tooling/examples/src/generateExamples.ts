import path from "path";
import { rimraf } from "rimraf";
import { fileURLToPath } from "url";
import { nextjs } from "./markdown";
import { CommonParams } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(path.join(__dirname, "../../.."));

const commonParams: CommonParams = {
  repoRoot,
  nextjsVersion: "14.2.3",
  llmUiVersion: "0.2.0",
};

(async () => {
  rimraf.sync(path.join(repoRoot, "/examples"));
  await nextjs(commonParams);
})();
