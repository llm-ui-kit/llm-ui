import { readdirSync } from "fs";
import { defineConfig } from "vitest/config";

const alias = (pkg: string) =>
  new URL(`./packages/${pkg}/src`, import.meta.url).pathname;

const aliases = readdirSync(
  new URL("./packages", import.meta.url).pathname,
).reduce<Record<string, string>>(
  (acc, pkg) => {
    acc[`@llm-ui/${pkg}`] = alias(pkg);
    return acc;
  },
  { "llm-ui": alias("llm-ui") },
);

export default defineConfig({
  test: {
    mockReset: true,
    coverage: {
      provider: "v8",
      include: ["**/src/**"],
      exclude: ["**/tooling/**"],
    },
  },
  esbuild: { target: "es2020" },
  resolve: { alias: aliases },
});
