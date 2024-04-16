export {
  codeBlockCompleteMatcher,
  codeBlockPartialMatcher as matchPartialCodeBlock,
} from "./matchers";

export { defaultOptions as defaultCodeBlockOptions } from "./options";
export type { CodeBlockOptions } from "./options";

export {
  parseCompleteMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";
export type { ParseFunction } from "./parse";

export { codeBlockLookBack } from "./lookBack";

export {
  ShikiCodeBlock,
  buildShikiCodeBlockComponent,
} from "./components/ShikiCodeBlock";
export type { ShikiCodeBlockComponent } from "./components/ShikiCodeBlock";

export { ShikiOrFallback } from "./components/ShikiFallback";

export { useCodeBlockToHtml } from "./hooks/useCodeBlockToHtml";
export type {
  UseCodeBlockToHtmlParams,
  UseCodeBlockToHtmlReturn,
} from "./hooks/useCodeBlockToHtml";

export { useCodeToHtml } from "./hooks/useCodeToHtml";
export type { UseCodeToHtmlParams } from "./hooks/useCodeToHtml";

export { loadHighlighter } from "./hooks/useLoadHighlighter";

export type { CodeToHtmlProps, LLMUIHighlighter, ShikiProps } from "./types";
