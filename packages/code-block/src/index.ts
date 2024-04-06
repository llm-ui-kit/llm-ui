import { LLMOutputComponent } from "llm-ui/components";
import {
  matchFullMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "./matchers";

export {
  defaultOptions as markdownDefaultOptions,
  matchFullMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "./matchers";
export type { MarkdownMatcherOptions } from "./matchers";

export const markdownCodeBlockComponent: LLMOutputComponent = {
  isFullMatch: matchFullMarkdownCodeBlock(),
  isPartialMatch: matchPartialMarkdownCodeBlock(),
  component: () => null,
  partialComponent: () => null,
};
