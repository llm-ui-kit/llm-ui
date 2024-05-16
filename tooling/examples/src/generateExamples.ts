import path from "path";
import { rimraf } from "rimraf";
import { fileURLToPath } from "url";
import { nextjs } from "./markdown";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(path.join(__dirname, "../../.."));

(async () => {
  rimraf.sync(path.join(repoRoot, "/examples"));
  await nextjs({ repoRoot });
})();
