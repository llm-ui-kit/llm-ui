import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/components/index.ts", "src/hooks/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
});
