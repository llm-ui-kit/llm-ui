import { HighlighterCoreOptions } from "shiki/core";

// `shiki/wasm` contains the wasm binary inlined as base64 string.
import getWasm from "shiki/wasm";

import {
  bundledLanguages,
  bundledLanguagesAlias,
  bundledLanguagesInfo,
} from "shiki/langs";

console.log("bundledLanguages", bundledLanguages);
console.log("bundledLanguagesAlias", bundledLanguagesAlias);
console.log("bundledLanguagesInfo", bundledLanguagesInfo);

const allLangs = bundledLanguagesInfo.map((lang) => lang.import());
// directly import the theme and language modules, only the ones you imported will be bundled.
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import nord from "shiki/themes/nord.mjs";
export const defaultOptions: HighlighterCoreOptions = {
  themes: [githubDark, githubLight, nord],
  langs: allLangs,
  loadWasm: getWasm,
};
