import { CodeToHastOptions, HighlighterCore } from "shiki/core";
import { SetOptional } from "type-fest";

export type CodeToHtmlOptions = SetOptional<CodeToHastOptions, "lang">;

export type ShikiProps = {
  highlighter: LLMUIHighlighter;
  codeToHtmlOptions: CodeToHtmlOptions;
};

export type LLMUIHighlighter = {
  getHighlighter: () => HighlighterCore | undefined;
  highlighterPromise: Promise<HighlighterCore>;
};
