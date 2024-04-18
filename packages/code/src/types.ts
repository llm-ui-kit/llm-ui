import { HighlighterCore } from "shiki/core";
import { SetOptional } from "type-fest";

export type CodeToHtmlProps = SetOptional<
  Parameters<HighlighterCore["codeToHtml"]>[1],
  "lang"
>;

export type ShikiProps = {
  highlighter: LLMUIHighlighter;
  codeToHtmlProps: CodeToHtmlProps;
};

export type LLMUIHighlighter = {
  getHighlighter: () => HighlighterCore | undefined;
  highlighterPromise: Promise<HighlighterCore>;
};
