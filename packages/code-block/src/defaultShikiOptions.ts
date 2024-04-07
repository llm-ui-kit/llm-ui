import { HighlighterCoreOptions } from "shiki/core";

// `shiki/wasm` contains the wasm binary inlined as base64 string.
import getWasm from "shiki/wasm";

import { bundledLanguagesInfo } from "shiki/langs";

const allLangs = bundledLanguagesInfo.map((lang) => lang.import());

import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import nord from "shiki/themes/nord.mjs";
export const defaultOptions: HighlighterCoreOptions = {
  themes: [githubDark, githubLight, nord],
  langs: allLangs,
  loadWasm: getWasm,
  // todo: aliases?
};
