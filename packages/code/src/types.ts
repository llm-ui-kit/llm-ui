import { CodeToHastOptions, HighlighterCore } from "shiki/core";

type OmitWithExclude<T, ToOmit> = {
  [P in keyof T as Exclude<P, ToOmit>]: T[P];
};

// Using Omit or SetOptional from type-fest removed other keys from CodeToHastOptions.
export type CodeToHtmlOptions = OmitWithExclude<CodeToHastOptions, "lang"> & {
  lang?: CodeToHastOptions["lang"];
};

export type ShikiProps = {
  highlighter: LLMUIHighlighter;
  codeToHtmlOptions: CodeToHtmlOptions;
};

export type LLMUIHighlighter = {
  getHighlighter: () => HighlighterCore | undefined;
  highlighterPromise: Promise<HighlighterCore>;
};
