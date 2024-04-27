import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/shikiBundles/allLangs.ts",
    "src/shikiBundles/allThemes.ts",
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
});
