import { $ } from "execa";
import fs from "fs/promises";
import Handlebars from "handlebars";
import path from "path";
import replace from "replace-in-file";
import { fileURLToPath } from "url";
import { setupGitIgnore } from "./gitIgnore";
import { setupCss } from "./setupCss";
import { shell } from "./shell";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupCssVite = (folder: string) => {
  return setupCss(path.join(folder, "src/index.css"));
};

type SetupViteOptions = {
  folder: string;
  exampleFolder: string;
  exampleName: string;
  exampleDescription: string;
  dependencies: string[];
  devDependencies: string[];
  viteVersion: string;
  withExpress?: boolean;
};

const tailwindDependencies = ["tailwindcss", "postcss", "autoprefixer"];
export const setupVite = async ({
  folder,
  exampleFolder,
  exampleName,
  exampleDescription,
  dependencies,
  devDependencies,
  viteVersion,
  withExpress,
}: SetupViteOptions) => {
  await $`mkdir -p ${folder}`;

  await shell({
    cwd: path.dirname(folder),
  })`npm create vite@${viteVersion} ${path.basename(folder)} -- --template react-ts`;

  await replace({
    files: [path.join(folder, "package.json")],
    from: /"name": ".*",/,
    to: `"name": "${exampleName}",\n  "license": "MIT",`,
  });

  if (withExpress) {
    dependencies.push("express");
    dependencies.push("vite-express");
    devDependencies.push("@types/express");
    devDependencies.push("tsx");
    await fs.cp(
      path.join(__dirname, "viteExpress.ts.hbs"),
      path.join(folder, "src/server.ts"),
    );
    await replace({
      files: [path.join(folder, "package.json")],
      from: /"dev": ".*",/,
      to: `"dev": "tsx src/server.ts",`,
    });
  }

  await shell({
    cwd: folder,
  })`npm install --save ${dependencies}`;

  await shell({
    cwd: folder,
  })`npm install --save-dev ${[...devDependencies, ...tailwindDependencies]}`;

  await fs.rm(path.join(folder, "package-lock.json"));

  await shell({
    cwd: folder,
  })`npx tailwindcss init --ts -p`;

  await replace({
    files: [path.join(folder, "index.html")],
    from: "<title>Vite + React + TS</title>",
    to: `<title>${exampleDescription}</title>`,
  });
  const tailwindConfig = path.join(folder, "tailwind.config.ts");

  await replace({
    files: [tailwindConfig],
    from: "content: [],",
    to: `content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],`,
  });

  await replace({
    files: [tailwindConfig],
    from: "plugins: [],",
    to: "plugins: [typography],",
  });

  await replace({
    files: [tailwindConfig],
    from: `\nexport default {`,
    to: `import typography from "@tailwindcss/typography";\n\nexport default {`,
  });

  await fs.rm(path.join(folder, "src/App.css"));

  const readMeTemplate = await fs.readFile(
    path.join(__dirname, "readme.md.hbs"),
    "utf8",
  );

  const template = Handlebars.compile(readMeTemplate);
  await fs.writeFile(
    path.join(folder, "readme.md"),
    template({ exampleFolder, exampleName, exampleDescription }),
  );

  await setupGitIgnore(folder);
  await setupCssVite(folder);
};
