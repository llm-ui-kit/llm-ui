export {
  defaultOptions as markdownDefaultOptions,
  matchCompleteMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "./matchers";
export type { MarkdownMatcherOptions } from "./matchers";

export {
  parseCompleteMarkdownCodeBlock,
  defaultOptions as parseDefaultOptions,
  parsePartialMarkdownCodeBlock,
} from "./parse";
export type { ParseFunction, ParseMarkdownCodeBlockOptions } from "./parse";

export {
  ShikiCompleteCodeBlock,
  ShikiPartialCodeBlock,
  buildShikiCompleteCodeBlock,
  buildShikiPartialCodeBlock,
} from "./shikiComponent";
export type {
  CodeToHtmlProps,
  ShikiCodeBlockComponent,
  ShikiCodeBlockProps,
  ShikiProps,
} from "./shikiComponent";

export { loadHighlighter } from "./loadHighlighter";
export type { LLMUIHighlighter } from "./loadHighlighter";
