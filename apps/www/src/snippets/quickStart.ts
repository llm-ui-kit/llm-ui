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
} from "@llm-ui/code";
// WARNING: Importing bundledThemes increases your bundle size
// see: https://llm-ui.com/docs/blocks/code#bundle-size
import { bundledThemes } from "shiki/themes";
import { type LLMOutputComponent } from "@llm-ui/react";
import parseHtml from "html-react-parser";
import { getHighlighterCore } from "shiki/core";
import { bundledLanguagesInfo } from "shiki/langs";

import getWasm from "shiki/wasm";`;

export const codeblockComponent = `const highlighter = loadHighlighter(
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
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputComponent, useStreamExample } from "@llm-ui/react";
import parseHtml from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getHighlighterCore } from "shiki/core";
// WARNING: Importing bundledLanguagesInfo will increase your bundle size
// See: https://llm-ui.com/docs/blocks/code#bundle-size
import { bundledThemes } from "shiki/themes";
import { bundledLanguagesInfo } from "shiki/langs";
import getWasm from "shiki/wasm";
`;
const step1Comment = "// -------Step 1: Create a markdown component-------";
const step2Comment = "// -------Step 2: Create a code block component-------";
const step3Comment =
  "// -------Step 3: Render markdown and code with llm-ui-------";

export const fullQuickStart = `${markdownAndCodeblockImports}\n\n${step1Comment}\n\n${markdownComponent}\n\n${step2Comment}\n\n${codeblockComponent}\n\n${step3Comment}\n\n${llmUiOutputUsage}\n\nexport default Example`;

export const customJsonSchema = `// buttonsSchema.ts
import z from "zod";

const buttonsSchema = z.object({
  type: z.literal("buttons"),
  buttons: z.array(z.object({ text: z.string() })),
});
`;

export const customButtonsComponent = `//imports here
const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isComplete) {
    return <div>Buttons loading...</div>;
  }
  // use buttonsSchema from step 2
  // todo parse safe
  const buttons = buttonsSchema.parse(parseJson5(blockMatch.output));

  return (
    <div>
      {buttons.btns.map((button, index) => (
        <button key={index}>{button.text}</button>
      ))}
    </div>
  );
};
`;

export const customButtonsUseLlmOutput = `//imports here
const { blockMatches } = useLLMOutput({
  llmOutput: output,
  blocks: [
    {
      ...customBlock("btn"),
      component: ButtonsComponent, // from step 3
    },
  ],
  fallbackBlock: {
    lookBack: markdownLookBack(),
    component: MarkdownComponent, // from step 2
  },
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

`;

export const generateButtonsPrompt = `import { jsonBlockPrompt } from "@llm-ui/json";

// use buttonsSchema from step 2
customBlockPrompt("Button", buttonsSchema, [
  { t: "btn", btns: [{ text: "Button 1" }, { text: "Button 2" }] },
]);
`;

export const fullCustomQuickStart = ``;
