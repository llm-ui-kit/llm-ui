import type { ShikiProps } from "@llm-ui/code";
import { allLangs, allLangsAlias, loadHighlighter } from "@llm-ui/code";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguagesInfo } from "shiki/langs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";

export const shikiConfig: ShikiProps = {
  highlighter: loadHighlighter(
    getHighlighterCore({
      langs: allLangs(bundledLanguagesInfo),
      langAlias: allLangsAlias(bundledLanguagesInfo),
      themes: [githubLight, githubDark],
      loadWasm: getWasm,
    }),
  ),
  codeToHtmlOptions: { themes: { light: "github-light", dark: "github-dark" } },
};
