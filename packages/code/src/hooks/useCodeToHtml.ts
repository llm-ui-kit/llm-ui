import { ShikiProps } from "../types";
import { useLoadHighlighter } from "./useLoadHighlighter";

export type UseCodeToHtmlParams = {
  code: string;
} & ShikiProps;

export const useCodeToHtml = ({
  code,
  highlighter,
  codeToHtmlOptions,
}: UseCodeToHtmlParams): string => {
  const shikiHighlighter = useLoadHighlighter(highlighter);
  if (!shikiHighlighter) {
    return "";
  }
  return shikiHighlighter.codeToHtml(code, {
    ...codeToHtmlOptions,
    lang: codeToHtmlOptions.lang ?? "plain",
  });
};
