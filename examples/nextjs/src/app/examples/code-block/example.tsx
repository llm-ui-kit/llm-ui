"use client";
import type { CodeToHtmlOptions } from "@llm-ui/code";
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
import { useStreamExample } from "@llm-ui/react/examples";
import parseHtml from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
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
    langs: allLangs,
    langAlias: allLangsAlias,
    themes: allThemes,
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

const example = `## Python

\`\`\`python
print('Hello llm-ui!')
\`\`\`

## Typescript

\`\`\`typescript
console.log('Hello llm-ui!');
\`\`\`
`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

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
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
