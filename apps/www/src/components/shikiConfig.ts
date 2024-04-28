import type { ShikiProps } from "@llm-ui/code";
import { loadHighlighter } from "@llm-ui/code";
import { allLangs, allLangsAlias } from "@llm-ui/code/shikiBundles/allLangs";
import { getHighlighterCore } from "shiki/core";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";

export const shikiConfig: ShikiProps = {
  highlighter: loadHighlighter(
    getHighlighterCore({
      langs: allLangs,
      langAlias: allLangsAlias,
      themes: [githubLight, githubDark],
      loadWasm: getWasm,
    }),
  ),
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};
