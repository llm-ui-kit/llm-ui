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

// directly import the theme and language modules, only the ones you imported will be bundled.
import nord from "shiki/themes/nord.mjs";

export const defaultOptions: HighlighterCoreOptions = {
  themes: [nord],
  langs: [],
  loadWasm: getWasm,
};
