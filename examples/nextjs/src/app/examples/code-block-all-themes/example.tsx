"use client";
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
import { useStreamExample } from "@llm-ui/react/examples";
import parseHtml from "html-react-parser";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

// --- Markdown setup start ---

// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent<Options> = ({
  blockMatch,
  ...props
}) => {
  const markdown = blockMatch.output;
  return (
    <ReactMarkdown
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

const example = `
## Code block example

Typescript:
\`\`\`typescript
console.log('Hello llm-ui!');
\`\`\`

Python:
\`\`\`python
print('Hello llm-ui!')
\`\`\`
`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

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
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
