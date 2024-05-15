export const markdownImports = `import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type LLMOutputComponent } from "@llm-ui/react";
`;

export const markdownComponent = `// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
};`;

export const markdownQuickStart = `${markdownImports}\n\n${markdownComponent}`;

export const codeblockImports = `import type { CodeToHtmlOptions } from "@llm-ui/code";
import {
  loadHighlighter,
  useCodeBlockToHtml,
  allLangs,
  allLangsAlias,
  // WARNING: Importing allThemes increases your bundle size
  // see: https://llm-ui.com/docs/blocks/code#bundle-size
  allThemes
} from "@llm-ui/code";
import { type LLMOutputComponent } from "@llm-ui/react";
import parseHtml from "html-react-parser";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguages } from "shiki/langs";
import getWasm from "shiki/wasm";`;

export const codeblockComponent = `const highlighter = loadHighlighter(
  getHighlighterCore({
    langs: allLangs(bundledLanguages),
    langAlias: allLangsAlias(bundledLanguages),
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
};`;

export const codeblockQuickstart = `${codeblockImports}\n\n${codeblockComponent}`;

export const llmUiOutputImports = `import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, useStreamExample } from "@llm-ui/react";`;

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

export const introExampleAll = introExampleHidden.replaceAll("HIDDEN", "");

export const introExampleAllDisplay = introExampleHidden
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
import type { CodeToHtmlOptions } from "@llm-ui/code";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
  loadHighlighter,
  useCodeBlockToHtml,
  allLangs,
  allLangsAlias,
  // WARNING: Importing allThemes will increase your bundle size
  // See: https://llm-ui.com/docs/blocks/code#bundle-size
  allThemes,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputComponent, useStreamExample } from "@llm-ui/react";
import parseHtml from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";
`;
const step1Comment = "// -------Step 1: Create a markdown component-------";
const step2Comment = "// -------Step 2: Create a code block component-------";
const step3Comment =
  "// -------Step 3: Render markdown and code with llm-ui-------";

export const fullQuickStart = `${markdownAndCodeblockImports}\n\n${step1Comment}\n\n${markdownComponent}\n\n${step2Comment}\n\n${codeblockComponent}\n\n${step3Comment}\n\n${llmUiOutputUsage}\n\nexport default Example`;

export const markdownAndCodeGithubExampleUrl =
  "https://github.com/llm-ui-kit/llm-ui/blob/main/examples/nextjs/src/app/examples/code-block/example.tsx";
