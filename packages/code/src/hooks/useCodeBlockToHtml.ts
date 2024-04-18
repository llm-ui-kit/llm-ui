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
  codeToHtmlProps,
  parser = parseCompleteMarkdownCodeBlock,
}: UseCodeBlockToHtmlParams) => {
  const { code = "\n", language } = parser(markdownCodeBlock);
  const lang = codeToHtmlProps.lang ?? language ?? "plain";
  const html = useCodeToHtml({
    code,
    highlighter,
    codeToHtmlProps: { ...codeToHtmlProps, lang },
  });
  return { html, code };
};
