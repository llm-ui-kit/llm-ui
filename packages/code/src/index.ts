export { findCompleteCodeBlock, findPartialCodeBlock } from "./matchers";

export { defaultOptions as defaultCodeBlockOptions } from "./options";
export type { CodeBlockOptions } from "./options";

export {
  parseCompleteMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";
export type { ParseFunction } from "./parse";

export { codeBlockLookBack } from "./lookBack";

export { useCodeBlockToHtml } from "./hooks/useCodeBlockToHtml";
export type {
  UseCodeBlockToHtmlParams,
  UseCodeBlockToHtmlReturn,
} from "./hooks/useCodeBlockToHtml";

export { useCodeToHtml } from "./hooks/useCodeToHtml";
export type { UseCodeToHtmlParams } from "./hooks/useCodeToHtml";

export { loadHighlighter } from "./hooks/useLoadHighlighter";

export type { CodeToHtmlOptions, LLMUIHighlighter, ShikiProps } from "./types";

export { allLangs, allLangsAlias } from "./shikiBundles/allLangs";
