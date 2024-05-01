import { ParseFunction, parseCompleteMarkdownCodeBlock } from "../parse";
import { ShikiProps } from "../types";
import { useCodeToHtml } from "./useCodeToHtml";

export type UseCodeBlockToHtmlParams = {
  markdownCodeBlock: string;
  parser?: ParseFunction;
} & ShikiProps;

export type UseCodeBlockToHtmlReturn = {
  html: string | undefined;
  code: string;
};

export const useCodeBlockToHtml = ({
  markdownCodeBlock,
  highlighter,
  codeToHtmlOptions,
  parser = parseCompleteMarkdownCodeBlock,
}: UseCodeBlockToHtmlParams) => {
  const { code = "\n", language } = parser(markdownCodeBlock);
  const lang = codeToHtmlOptions.lang ?? language ?? "plain";
  const html = useCodeToHtml({
    code,
    highlighter,
    codeToHtmlOptions: { ...codeToHtmlOptions, lang },
  });
  return { html, code };
};
