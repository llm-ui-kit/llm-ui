import db from "@astrojs/db";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import simpleStackForm from "simple-stack-form";

let adapter = vercel({
  maxDuration: 60,
});

if (process.env.ADAPTER === "node") {
  adapter = node({ mode: "standalone" });
}

// https://astro.build/config
export default defineConfig({
  site: "https://llm-ui.com",
  redirects: {
    "/docs": "/docs/quick-start",
    "/demo/presentation": "/demo/presentation/1",
  },
  integrations: [
    mdx({
      syntaxHighlight: "shiki",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      gfm: true,
    }),
    icon(),
    sitemap(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    db(),
    simpleStackForm(),
  ],
  output: "hybrid",
  adapter,
});
