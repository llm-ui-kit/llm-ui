import parseHtml from "html-react-parser";
import { LLMOutputComponent } from "llm-ui/components";
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

export type ShikiCodeBlockComponent = LLMOutputComponent<ShikiProps>;

export const ShikiCode: React.FC<ShikiProps & { code: string }> = ({
  highlighter: llmuiHighlighter,
  codeToHtmlProps,
  code,
}) => {
  const highlighter = useLoadHighlighter(llmuiHighlighter);

  const getHtml = useCallback(() => {
    if (!highlighter) {
      return "";
    }
    return highlighter.codeToHtml(code, {
      ...codeToHtmlProps,
      lang: codeToHtmlProps.lang ?? "plain",
    });
  }, [code, highlighter]);
  return <>{parseHtml(getHtml())}</>;
};

// Shiki Markdown code block component
export const ShikiCodeBlock: LLMOutputComponent<
  ShikiProps & {
    parser?: ParseFunction;
  }
> = ({
  llmOutput: markdownCodeBlock,
  parser = parseCompleteMarkdownCodeBlock,
  ...props
}) => {
  const { code = "\n", language } = parser(markdownCodeBlock);
  const lang = props.codeToHtmlProps.lang ?? language ?? "plain";
  return (
    <ShikiCode
      {...props}
      codeToHtmlProps={{
        ...props.codeToHtmlProps,
        lang,
      }}
      code={code}
    />
  );
};

export const buildShikiCodeBlockComponent = (
  shikiProps: ShikiProps,
): ShikiCodeBlockComponent => {
  const BuiltShikiCodeBlock: ShikiCodeBlockComponent = (props) => (
    <ShikiCodeBlock {...shikiProps} {...props} />
  );
  return BuiltShikiCodeBlock;
};
