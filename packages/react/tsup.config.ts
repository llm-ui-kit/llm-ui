import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/components/index.ts",
    "src/examples/index.ts",
    "src/throttle/index.ts",
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
});
