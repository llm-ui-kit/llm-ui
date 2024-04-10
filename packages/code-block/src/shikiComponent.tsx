import { LLMOutputReactComponent } from "llm-ui/components";
import { useCallback } from "react";
import { HighlighterCore } from "shiki/core";
import { SetOptional } from "type-fest";
import { LLMUIHighlighter, useLoadHighlighter } from "./loadHighlighter";
import { ParseFunction, parseCompleteMarkdownCodeBlock } from "./parse";

export type CodeToHtmlProps = SetOptional<
  Parameters<HighlighterCore["codeToHtml"]>[1],
  "lang"
>;

export type ShikiProps = {
  highlighter: LLMUIHighlighter;
  codeToHtmlProps: CodeToHtmlProps;
};

export type ShikiCodeBlockProps = ShikiProps & React.HTMLProps<HTMLDivElement>;

export type ShikiCodeBlockComponent =
  LLMOutputReactComponent<ShikiCodeBlockProps>;

export const ShikiCodeBlock: LLMOutputReactComponent<
  ShikiCodeBlockProps & {
    parser?: ParseFunction;
  }
> = ({
  llmOutput,
  highlighter: llmuiHighlighter,
  codeToHtmlProps,
  parser = parseCompleteMarkdownCodeBlock,
  ...props
}) => {
  const highlighter = useLoadHighlighter(llmuiHighlighter);

  const getHtml = useCallback(() => {
    if (!highlighter) {
      return "";
    }
    const { code = "\n", language } = parser(llmOutput);

    return highlighter.codeToHtml(code, {
      ...codeToHtmlProps,
      lang: codeToHtmlProps.lang ?? language ?? "plain",
    });
  }, [llmOutput, highlighter]);

  return <div {...props} dangerouslySetInnerHTML={{ __html: getHtml() }} />;
};

export const buildShikiCodeBlockComponent = (
  shikiProps: ShikiProps,
): ShikiCodeBlockComponent => {
  const BuiltShikiCodeBlock: ShikiCodeBlockComponent = (props) => (
    <ShikiCodeBlock {...shikiProps} {...props} />
  );
  return BuiltShikiCodeBlock;
};
