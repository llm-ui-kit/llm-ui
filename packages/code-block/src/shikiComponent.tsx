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

const PreFallback: React.FC<{ code: string }> = ({ code }) => (
  <pre className="shiki">
    <code>{code}</code>
  </pre>
);

export const ShikiCode: React.FC<ShikiProps & { code: string }> = ({
  highlighter: llmuiHighlighter,
  codeToHtmlProps,
  code,
}) => {
  const highlighter = useLoadHighlighter(llmuiHighlighter);

  const getHtml: () => string | undefined = useCallback(() => {
    if (!highlighter) {
      return "";
    }
    return highlighter.codeToHtml(code, {
      ...codeToHtmlProps,
      lang: codeToHtmlProps.lang ?? "plain",
    });
  }, [code, highlighter]);
  const html = getHtml();
  if (!html) {
    return (
      <pre className="shiki">
        <code>{code}</code>
      </pre>
    );
  }
  return html ? <>{parseHtml(html)}</> : <PreFallback code={code} />;
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
