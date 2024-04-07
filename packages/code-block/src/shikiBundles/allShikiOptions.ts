import { HighlighterCoreOptions } from "shiki/core";

// `shiki/wasm` contains the wasm binary inlined as base64 string.
import getWasm from "shiki/wasm";
import { allLangs, allLangsAlias } from "./allLangs";
import { allThemes } from "./allThemes";

export const allHighlighterOptions: HighlighterCoreOptions = {
  themes: allThemes,
  langs: allLangs,
  loadWasm: getWasm,
  langAlias: allLangsAlias,
};
