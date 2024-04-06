import { LLMOutputReactComponent } from "llm-ui/components";
import { useEffect, useMemo, useRef } from "react";
import {
  HighlighterCore,
  HighlighterCoreOptions,
  getHighlighterCore,
} from "shiki/core";
import { parseFullMarkdownCodeBlock } from "./parse";

type CodeToHtmlProps = Parameters<HighlighterCore["codeToHtml"]>[1];

export const ShikiCodeBlock: LLMOutputReactComponent<{
  highlighterOptions: HighlighterCoreOptions;
  codeToHtmlProps: CodeToHtmlProps;
}> = ({ llmOutput, highlighterOptions, codeToHtmlProps }) => {
  const highlighterRef = useRef<HighlighterCore>();
  useEffect(() => {
    (async () => {
      const highlighter = await getHighlighterCore(highlighterOptions);
      highlighterRef.current = highlighter;
    })();
  }, []);

  const html = useMemo(() => {
    if (!highlighterRef.current) {
      return "";
    }
    const { code, language } = parseFullMarkdownCodeBlock(llmOutput);
    if (!code) {
      return "";
    }
    return highlighterRef.current.codeToHtml(code, {
      ...codeToHtmlProps,
      lang: codeToHtmlProps.lang ?? language ?? "plain",
    });
  }, [llmOutput]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
