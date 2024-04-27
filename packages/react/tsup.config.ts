import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/core/index.ts",
    "src/examples/index.ts",
    "src/throttle/index.ts",
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
});
