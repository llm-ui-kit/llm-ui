import { UserConfig } from "vitest/config";

export const baseConfig: UserConfig = {
  test: {
    mockReset: true,
    coverage: {
      provider: "v8",
      include: ["**/src/**"],
      exclude: ["**/tooling/**"],
    },
  },
  esbuild: { target: "es2020" },
};
