import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupCss = async (cssFilePath: string) => {
  await fs.copyFile(path.join(__dirname, "app.css.hbs"), cssFilePath);
};
