import { LLMOutputComponent } from "llm-ui/core";
import {
  UseCodeBlockToHtmlParams,
  useCodeBlockToHtml,
} from "../hooks/useCodeBlockToHtml";
import { parseCompleteMarkdownCodeBlock } from "../parse";
import { ShikiProps } from "../types";
import { ShikiOrFallback } from "./ShikiFallback";

export type ShikiCodeBlockComponent = LLMOutputComponent<ShikiProps>;

// Shiki Markdown code block component
export const ShikiCodeBlock: LLMOutputComponent<
  Omit<UseCodeBlockToHtmlParams, "markdownCodeBlock">
> = ({ blockMatch, parser = parseCompleteMarkdownCodeBlock, ...props }) => {
  const { html, code } = useCodeBlockToHtml({
    markdownCodeBlock: blockMatch.output,
    parser,
    ...props,
  });
  return <ShikiOrFallback html={html} code={code} />;
};

export const buildShikiCodeBlockComponent = (
  shikiProps: ShikiProps,
): ShikiCodeBlockComponent => {
  const BuiltShikiCodeBlock: ShikiCodeBlockComponent = (props) => (
    <ShikiCodeBlock {...shikiProps} {...props} />
  );
  return BuiltShikiCodeBlock;
};
