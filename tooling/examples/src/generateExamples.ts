import path from "path";
import { rimraf } from "rimraf";
import { fileURLToPath } from "url";
import { examples } from "./examples";
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
  for (const example of examples) {
    console.log(`Generating: ${example.folder}`);
    await example.generate(commonParams);
  }
})();
