w"use client";
import type { CodeToHtmlProps } from "@llm-ui/code";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
  loadHighlighter,
  useCodeBlockToHtml,
} from "@llm-ui/code";
import { allLangs, allLangsAlias } from "@llm-ui/code/shikiBundles/allLangs";
import { allThemes } from "@llm-ui/code/shikiBundles/allThemes"; // WARNING: This import will increase your bundle size, see: https://llm-ui.com/docs/blocks/code#bundle-size
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputComponent } from "@llm-ui/react/core";
import parseHtml from "html-react-parser";
import { useCallback, useState } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

const NEWLINE = "$NEWLINE$";

// --- Markdown setup start ---

// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent<Options> = ({
  blockMatch,
  ...props
}) => {
  const markdown = blockMatch.output;
  return (
    <ReactMarkdown
      className="prose prose-invert"
      {...props}
      remarkPlugins={[...(props.remarkPlugins ?? []), remarkGfm]}
    >
      {markdown}
    </ReactMarkdown>
  );
};
// --- Markdown setup end ---

// --- Code block setup start ---
const highlighter = loadHighlighter(
  getHighlighterCore({
    langs: allLangs,
    langAlias: allLangsAlias,
    themes: allThemes, // WARNING: importing allThemes increases your bundle size, see: https://llm-ui.com/docs/blocks/code#bundle-size
    loadWasm: getWasm,
  }),
);

const codeToHtmlProps: CodeToHtmlProps = {
  theme: "github-dark",
};

// Customize this component with your own styling
const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const { html, code } = useCodeBlockToHtml({
    markdownCodeBlock: blockMatch.output,
    highlighter,
    codeToHtmlProps,
  });
  if (!html) {
    // fallback to <pre> if Shiki is not loaded yet
    return (
      <pre className="shiki">
        <code>{code}</code>
      </pre>
    );
  }
  return <>{parseHtml(html)}</>;
};
// --- Code block setup end ---

const Example = () => {
  const [output, setOutput] = useState<string>("");
  const [isStreamFinished, setIsStreamFinished] = useState<boolean>(false);
  const startChat = useCallback(() => {
    setOutput("");
    // Change the prompt in: examples/nextjs/src/app/api/openai/route.ts
    const eventSource = new EventSource(`/api/openai`);

    eventSource.addEventListener("error", () => eventSource.close());

    eventSource.addEventListener("token", (e) => {
      // avoid newlines getting messed up
      const token = e.data.replaceAll(NEWLINE, "\n");
      setOutput((prevResponse) => `${prevResponse}${token}`);
    });

    eventSource.addEventListener("finished", (e) => {
      console.log("finished", e);
      eventSource.close();
      setIsStreamFinished(true);
    });

    () => eventSource.close();
  }, []);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        component: CodeBlock,
        findCompleteMatch: findCompleteCodeBlock(),
        findPartialMatch: findPartialCodeBlock(),
        lookBack: codeBlockLookBack(),
      },
    ],
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack,
    },
    isStreamFinished,
  });

  return (
    <div className="flex flex-col gap-4">
      {output.length === 0 && <button onClick={startChat}>Start</button>}
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
