import { ShikiProps } from "../types";
import { useLoadHighlighter } from "./useLoadHighlighter";

export type UseCodeToHtmlParams = {
  code: string;
} & ShikiProps;

export const useCodeToHtml = ({
  code,
  highlighter,
  codeToHtmlProps,
}: UseCodeToHtmlParams): string => {
  const shikiHighlighter = useLoadHighlighter(highlighter);
  if (!shikiHighlighter) {
    return "";
  }
  return shikiHighlighter.codeToHtml(code, {
    ...codeToHtmlProps,
    lang: codeToHtmlProps.lang ?? "plain",
  });
};
