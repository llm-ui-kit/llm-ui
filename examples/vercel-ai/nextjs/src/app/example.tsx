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
import { useChat } from "ai/react";
import parseHtml from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguagesInfo } from "shiki/langs";

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

const Message: React.FC<{ message: string; isStreamFinished: boolean }> = ({
  message,
  isStreamFinished,
}) => {
  const { blockMatches } = useLLMOutput({
    llmOutput: message,
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
    <>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </>
  );
};

const Example = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  return (
    <div className="flex flex-col w-full h-screen my-0 bg-transparent">
      <div className="flex flex-col flex-1 my-2 rounded-lg bg-black p-8">
        <div className="flex flex-col stretch flex-1 overflow-y-auto">
          {messages.map((m, index) => {
            m.role === "assistant";
            m.role === "system";
            const isStreamFinished =
              ["user", "system"].includes(m.role) ||
              index < messages.length - 1 ||
              !isLoading;
            return (
              <div key={m.id} className="whitespace-pre-wrap">
                {m.role === "user" ? "User: " : "AI: "}
                <Message
                  message={m.content}
                  isStreamFinished={isStreamFinished}
                />
              </div>
            );
          })}
        </div>
        <form className="flex justify-center" onSubmit={handleSubmit}>
          <input
            className="w-full p-2 border border-gray-300 rounded shadow-xl text-black"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
};

export default Example;
