import { LLMOutputReactComponent } from "llm-ui/components";
import { useCallback } from "react";
import { HighlighterCore } from "shiki/core";
import { SetOptional } from "type-fest";
import { LLMUIHighlighter, useLoadHighlighter } from "./loadHighlighter";
import {
  ParseFunction,
  parseCompleteMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";

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

const ShikiCodeBlock: LLMOutputReactComponent<
  ShikiCodeBlockProps & {
    parser: ParseFunction;
  }
> = ({
  match,
  highlighter: llmuiHighlighter,
  codeToHtmlProps,
  parser,
  ...props
}) => {
  const highlighter = useLoadHighlighter(llmuiHighlighter);

  const getHtml = useCallback(() => {
    if (!highlighter) {
      return "";
    }
    const { code = "\n", language } = parser(match.output);

    return highlighter.codeToHtml(code, {
      ...codeToHtmlProps,
      lang: codeToHtmlProps.lang ?? language ?? "plain",
    });
  }, [match.output, highlighter]);

  return <div {...props} dangerouslySetInnerHTML={{ __html: getHtml() }} />;
};

export const ShikiCompleteCodeBlock: ShikiCodeBlockComponent = (props) => (
  <ShikiCodeBlock {...props} parser={parseCompleteMarkdownCodeBlock} />
);

export const buildShikiCompleteCodeBlock = (
  shikiProps: ShikiProps,
): ShikiCodeBlockComponent => {
  const BuiltShikiCompleteCodeBlock: ShikiCodeBlockComponent = (props) => (
    <ShikiCompleteCodeBlock {...shikiProps} {...props} />
  );
  return BuiltShikiCompleteCodeBlock;
};

export const ShikiPartialCodeBlock: ShikiCodeBlockComponent = (props) => (
  <ShikiCodeBlock {...props} parser={parsePartialMarkdownCodeBlock} />
);

export const buildShikiPartialCodeBlock = (
  shikiProps: ShikiProps,
): ShikiCodeBlockComponent => {
  const BuiltShikiPartialCodeBlock: ShikiCodeBlockComponent = (props) => (
    <ShikiPartialCodeBlock {...shikiProps} {...props} />
  );
  return BuiltShikiPartialCodeBlock;
};
