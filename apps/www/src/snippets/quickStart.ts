export const markdownImports = `import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { type LLMOutputComponent } from "@llm-ui/react/core";
`;

export const markdownComponent = `// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
};`;

export const markdownQuickStart = `${markdownImports}\n\n${markdownComponent}`;

export const codeblockImports = `import type { CodeToHtmlProps } from "@llm-ui/code";
import { loadHighlighter, useCodeBlockToHtml } from "@llm-ui/code";
import { allLangs, allLangsAlias } from "@llm-ui/code/shikiBundles/allLangs";
// WARNING: Importing allThemes increases your bundle size
// see: https://llm-ui.com/docs/blocks/code#bundle-size
import { allThemes } from "@llm-ui/code/shikiBundles/allThemes";
import { type LLMOutputComponent } from "@llm-ui/react/core";
import parseHtml from "html-react-parser";
import { getHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";`;

export const codeblockComponent = `const highlighter = loadHighlighter(
  getHighlighterCore({
    langs: allLangs,
    langAlias: allLangsAlias,
    themes: allThemes,
    loadWasm: getWasm,
  }),
);

const codeToHtmlProps: CodeToHtmlProps = {
  // @ts-ignore
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
};`;

export const codeblockQuickstart = `${codeblockImports}\n\n${codeblockComponent}`;

export const llmUiOutputImports = `import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput } from "@llm-ui/react/core";
import { useStreamExample } from "@llm-ui/react/examples";`;

export const introExampleHidden = `## Python

\\\`\\\`\\\`python
print('Hello llm-ui!')
\\\`\\\`\\\`
HIDDEN
## Typescript

\\\`\\\`\\\`typescript
console.log('Hello llm-ui!');
\\\`\\\`\\\`
HIDDEN`;

export const quickStartExampleHidden = introExampleHidden;

export const quickStartExampleVisible = quickStartExampleHidden.replace(
  /HIDDEN[^]*HIDDEN\s*/,
  "...continues...\n",
);

export const introExampleAll = introExampleHidden
  .replaceAll("HIDDEN", "")
  .replaceAll("\\`", "`");

export const getLlmUiOutputUsage = (
  example: string,
  step1Replace = "",
  step2Replace = "",
) =>
  `const example = \`${example}\`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    fallbackBlock: {
      component: MarkdownComponent, STEP1
      lookBack: markdownLookBack(),
    },
    blocks: [
      {
        component: CodeBlock, STEP2
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
};`
    .replaceAll("STEP1", step1Replace)
    .replaceAll("STEP2", step2Replace);

export const llmUiOutputUsage = getLlmUiOutputUsage(introExampleAll);

export const llmUiOutputUsageStep = getLlmUiOutputUsage(
  quickStartExampleVisible,
  "// from Step 1",
  "// from Step 2",
);

export const llmUiOutputQuickStart = `${llmUiOutputImports}\n\n${llmUiOutputUsage}`;
export const llmUiOutputQuickStartStep = `${llmUiOutputImports}\n\n${llmUiOutputUsageStep}`;

export const markdownAndCodeblockImports = `"use client";
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
`;

export const fullQuickStart = `${markdownAndCodeblockImports}\n\n${markdownComponent}\n\n${codeblockComponent}\n\n${llmUiOutputUsage}\n\nexport default Example`;

export const markdownAndCodeGithubExampleUrl =
  "https://github.com/llm-ui-kit/llm-ui/blob/main/examples/nextjs/src/app/examples/code-block/example.tsx";
