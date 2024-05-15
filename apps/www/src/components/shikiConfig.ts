import type { ShikiProps } from "@llm-ui/code";
import { allLangs, allLangsAlias, loadHighlighter } from "@llm-ui/code";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguages } from "shiki/langs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";

export const shikiConfig: ShikiProps = {
  highlighter: loadHighlighter(
    getHighlighterCore({
      langs: allLangs(bundledLanguages),
      langAlias: allLangsAlias(bundledLanguages),
      themes: [githubLight, githubDark],
      loadWasm: getWasm,
    }),
  ),
  codeToHtmlOptions: { themes: { light: "github-light", dark: "github-dark" } },
};
