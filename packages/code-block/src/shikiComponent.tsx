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
  parseFullMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";

type CodeToHtmlProps = Parameters<HighlighterCore["codeToHtml"]>[1];

export type ShikiCodeBlockProps = {
  highlighterOptions: HighlighterCoreOptions;
  codeToHtmlProps: SetOptional<CodeToHtmlProps, "lang">;
} & React.HTMLProps<HTMLDivElement>;

export type ShikiCodeBlockComponent =
  LLMOutputReactComponent<ShikiCodeBlockProps>;

const ShikiCodeBlock: LLMOutputReactComponent<
  ShikiCodeBlockProps & {
    parser: ParseFunction;
  }
> = ({ llmOutput, highlighterOptions, codeToHtmlProps, parser, ...props }) => {
  const highlighterRef = useRef<HighlighterCore>();
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

export const ShikiFullCodeBlock: ShikiCodeBlockComponent = (props) => (
  <ShikiCodeBlock {...props} parser={parseFullMarkdownCodeBlock} />
);

export const ShikiPartialCodeBlock: ShikiCodeBlockComponent = (props) => (
  <ShikiCodeBlock {...props} parser={parsePartialMarkdownCodeBlock} />
);
