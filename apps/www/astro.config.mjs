import db from "@astrojs/db";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import simpleStackForm from "simple-stack-form";
import { siteConfig } from "./src/config/site";

// https://astro.build/config
export default defineConfig({
  site: "https://llm-ui.com",
  redirects: {
    "/docs": "/docs/getting-started",
    "/discord": siteConfig.links.discord,
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
  adapter: vercel(),
});
