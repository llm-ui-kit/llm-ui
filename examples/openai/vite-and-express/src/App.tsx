"use client";
import type { CodeToHtmlOptions } from "@llm-ui/code";
import {
  allLangs,
  allLangsAlias,
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
  loadHighlighter,
  useCodeBlockToHtml,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputComponent } from "@llm-ui/react";
import parseHtml from "html-react-parser";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguagesInfo } from "shiki/langs";
import { MARKDOWN_PROMPT, NEWLINE } from "./constants";
// WARNING: Importing bundledThemes will increase your bundle size
// see: https://llm-ui.com/docs/blocks/code#bundle-size
import { bundledThemes } from "shiki/themes";
import getWasm from "shiki/wasm";

// -------Step 1: Create a markdown component-------

// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;
  return (
    <ReactMarkdown className={"markdown"} remarkPlugins={[remarkGfm]}>
      {markdown}
    </ReactMarkdown>
  );
};

// -------Step 2: Create a code block component-------

const highlighter = loadHighlighter(
  getHighlighterCore({
    langs: allLangs(bundledLanguagesInfo),
    langAlias: allLangsAlias(bundledLanguagesInfo),
    themes: Object.values(bundledThemes),
    loadWasm: getWasm,
  }),
);

const codeToHtmlOptions: CodeToHtmlOptions = {
  theme: "github-dark",
};

// Customize this component with your own styling
const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const { html, code } = useCodeBlockToHtml({
    markdownCodeBlock: blockMatch.output,
    highlighter,
    codeToHtmlOptions,
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

// -------Step 3: Render markdown and code with llm-ui-------

const Example = () => {
  const [output, setOutput] = useState<string>("");
  const [isStarted, setIsStarted] = useState(false);
  const [isStreamFinished, setIsStreamFinished] = useState<boolean>(false);
  const startChat = useCallback(() => {
    setIsStarted(true);
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
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
    blocks: [
      {
        component: CodeBlock,
        findCompleteMatch: findCompleteCodeBlock(),
        findPartialMatch: findPartialCodeBlock(),
        lookBack: codeBlockLookBack(),
      },
    ],
    isStreamFinished,
  });

  return (
    <div>
      <p>Prompt: {MARKDOWN_PROMPT}</p>
      {!isStarted && <button onClick={startChat}>Start</button>}
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
