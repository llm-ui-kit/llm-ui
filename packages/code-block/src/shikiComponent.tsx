import { LLMOutputReactComponent } from "llm-ui/components";
import { useEffect, useRef, useState } from "react";
import {
  HighlighterCore,
  HighlighterCoreOptions,
  getHighlighterCore,
} from "shiki/core";
import { SetOptional } from "type-fest";
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
  highlighterOptions: HighlighterCoreOptions;
  codeToHtmlProps: CodeToHtmlProps;
};

export type ShikiCodeBlockProps = ShikiProps & React.HTMLProps<HTMLDivElement>;

export type ShikiCodeBlockComponent =
  LLMOutputReactComponent<ShikiCodeBlockProps>;

const ShikiCodeBlock: LLMOutputReactComponent<
  ShikiCodeBlockProps & {
    parser: ParseFunction;
  }
> = ({ llmOutput, highlighterOptions, codeToHtmlProps, parser, ...props }) => {
  const highlighterRef = useRef<HighlighterCore | undefined>();
  const [html, setHtml] = useState("");
  useEffect(() => {
    (async () => {
      if (!highlighterRef.current) {
        highlighterRef.current = await getHighlighterCore(highlighterOptions);
      }
      const { code = "\n", language } = parser(llmOutput);
      const html = highlighterRef.current.codeToHtml(code, {
        ...codeToHtmlProps,
        lang: codeToHtmlProps.lang ?? language ?? "plain",
      });
      setHtml(html);
    })();
  }, [llmOutput, highlighterOptions, codeToHtmlProps]);

  return <div {...props} dangerouslySetInnerHTML={{ __html: html }} />;
};

export const ShikiCompleteCodeBlock: ShikiCodeBlockComponent = (props) => (
  <ShikiCodeBlock {...props} parser={parseCompleteMarkdownCodeBlock} />
);

export const buildShikiCompleteCodeBlock =
  (shikiProps: ShikiProps): ShikiCodeBlockComponent =>
  (props) => <ShikiCompleteCodeBlock {...shikiProps} {...props} />;

export const ShikiPartialCodeBlock: ShikiCodeBlockComponent = (props) => (
  <ShikiCodeBlock {...props} parser={parsePartialMarkdownCodeBlock} />
);

export const buildShikiPartialCodeBlock =
  (shikiProps: ShikiProps): ShikiCodeBlockComponent =>
  (props) => <ShikiPartialCodeBlock {...shikiProps} {...props} />;
