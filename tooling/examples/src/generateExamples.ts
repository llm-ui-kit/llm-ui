import path from "path";
import { rimraf } from "rimraf";
import { fileURLToPath } from "url";
import { examples } from "./examples";
import { CommonParams } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(path.join(__dirname, "../../.."));

const commonParams: CommonParams = {
  repoRoot,
  examplesFolder: path.join(repoRoot, "examples"),
  nextjsVersion: "14.2.3",
  viteVersion: "5.2.3",
  llmUiVersion: "0.13.0",
};

(async () => {
  rimraf.sync(commonParams.examplesFolder);
  for (const example of examples) {
    console.log(`Generating: ${example.folder}`);
    await example.generate(commonParams);
  }
})();
