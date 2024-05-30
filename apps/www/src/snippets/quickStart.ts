import {
  csvBlockExample,
  csvBlockPrompt,
  type CsvBlockOptions,
} from "@llm-ui/csv";
import prettier from "@prettier/sync";

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

export const jsonSchema = `// buttonsSchema.ts
import z from "zod";

const buttonsSchema = z.object({
  type: z.literal("buttons"),
  buttons: z.array(z.object({ text: z.string() })),
});
`;

export const jsonComponent = `import { parseJson5 } from "@llm-ui/json";
import { type LLMOutputComponent } from "@llm-ui/react";

// Customize this component with your own styling
const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) {
    return null;
  }
  // use buttonsSchema from step 2
  const { data: buttons, error } = buttonsSchema.safeParse(
    parseJson5(blockMatch.output),
  );

  if (error) {
    return <div>{error.toString()}</div>;
  }
  return (
    <div>
      {buttons.buttons.map((button, index) => (
        <button key={index}>{button.text}</button>
      ))}
    </div>
  );
};
`;

export const jsonUseLlmOutput = `import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, useStreamExample } from "@llm-ui/react";
import { jsonBlock } from "@llm-ui/json";

const example = \`Buttons:

【{type:"buttons",buttons:[{text:"Star ⭐"}, {text:"Confetti 🎉"}]}】
\`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);


  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        ...jsonBlock({type: "buttons"}),
        component: ButtonsComponent, // from step 3
      },
    ],
    fallbackBlock: {
      lookBack: markdownLookBack(),
      component: MarkdownComponent, // from step 1
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
}

`;

export const generateJsonPrompt = `import { jsonBlockPrompt } from "@llm-ui/json";

const prompt = jsonBlockPrompt({
  name: "Button",
  schema: buttonsSchema,
  examples: [
    { type: "buttons", buttons: [{ text: "Button 1" }, { text: "Button 2" }] },
  ],
  options: {
    type: "buttons",
  },
});`;

export const fullJsonQuickStart = `import { jsonBlock, jsonBlockPrompt, parseJson5 } from "@llm-ui/json";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  useLLMOutput,
  useStreamExample,
  type LLMOutputComponent,
} from "@llm-ui/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import z from "zod";

const buttonsSchema = z.object({
  type: z.literal("buttons"),
  buttons: z.array(z.object({ text: z.string() })),
});

const buttonsPrompt = jsonBlockPrompt({
  name: "buttons",
  schema: buttonsSchema,
  examples: [
    { type: "buttons", buttons: [{ text: "Button 1" }, { text: "Button 2" }] },
  ],
  options: {type: "buttons"},
});
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

// -------Step 2: Create a buttons component-------

// Customize this component with your own styling
const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) {
    return null;
  }
  const { data: buttons, error } = buttonsSchema.safeParse(
    parseJson5(blockMatch.output),
  );

  if (error) {
    return <div>{error.toString()}</div>;
  }
  return (
    <div>
      {buttons.buttons.map((button, index) => (
        <button key={index}>{button.text}</button>
      ))}
    </div>
  );
};

// -------Step 3: Render markdown with llm-ui-------

const example = \`
## Example
 more text 123
 more text 123
【{"type":"buttons","buttons":[{"text":"Button 1"},{"text":"Button 2"}]}】
one more time
\`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        ...jsonBlock({type: "buttons"}),
        component: ButtonsComponent,
      },
    ],
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
    isStreamFinished,
  });
  return (
    <div>
      <pre>Prompt: {buttonsPrompt}</pre>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
`;

export const csvComponent = `import { type LLMOutputComponent } from "@llm-ui/react";
import { parseCsv } from '@llm-ui/csv'

// Customize this component with your own styling
const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) {
    return null;
  }
  const [_type, ...buttons] = parseCsv(blockMatch.output, {type: 'buttons'});

  return (
    <div>
      {buttons.map((buttonText, index) => (
        <button key={index}>{buttonText}</button>
      ))}
    </div>
  );
};`;

export const csvUseLlmOutput = `import { csvBlock } from "@llm-ui/csv";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  useLLMOutput,
  useStreamExample,
} from "@llm-ui/react";

const example = \`
Buttons
⦅buttons,Button 1,Button2⦆
\`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        ...csvBlock({type: 'buttons'}), // from step 2
        component: ButtonsComponent,
      },
    ],
    fallbackBlock: {
      component: MarkdownComponent, // from step 1
      lookBack: markdownLookBack(),
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
};

`;

export const getCsvPromptOptions = (
  options: CsvBlockOptions = { type: "buttons" },
) => ({
  name: "Buttons",
  examples: [["Button 1", "Button 2"]],
  options,
});

export const fullCsvOptions = {
  type: "buttons",
  delimiter: ";",
  startChar: "[",
  endChar: "]",
};

export const generateCsvPromptCode = (
  options: CsvBlockOptions = { type: "buttons" },
) =>
  prettier.format(
    `import { csvBlockPrompt } from "@llm-ui/csv";

const prompt = csvBlockPrompt(${JSON.stringify(getCsvPromptOptions(options))});`,
    { parser: "typescript", printWidth: 60 },
  );

export const getCsvPrompt = (options: CsvBlockOptions | undefined) =>
  csvBlockPrompt(getCsvPromptOptions(options));

export const generateCsvExampleCode = (
  options: CsvBlockOptions = { type: "buttons" },
) =>
  prettier.format(
    `import { csvBlockExample } from "@llm-ui/csv";

const prompt = csvBlockExample(["Button 1", "Button 2"], ${JSON.stringify(options)});`,
    { parser: "typescript", printWidth: 60 },
  );

export const getCsvExample = (options: CsvBlockOptions = { type: "buttons" }) =>
  csvBlockExample(["Button 1", "Button 2"], options);

export const fullCsvQuickStart = `import { csvBlock, csvBlockPrompt, parseCsv } from "@llm-ui/csv";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  useLLMOutput,
  useStreamExample,
  type LLMOutputComponent,
} from "@llm-ui/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const options = {
  type: "buttons",
};

const buttonsPrompt = csvBlockPrompt({
  name: "buttons",
  examples: [["Button 1", "Button 2"]],
  options,
});
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

// -------Step 2: Create a buttons component-------

// Customize this component with your own styling
const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) {
    return null;
  }
  const [_type, ...buttons] = parseCsv(blockMatch.output, options);

  return (
    <div>
      {buttons.map((buttonText, index) => (
        <button key={index}>{buttonText}</button>
      ))}
    </div>
  );
};

// -------Step 3: Render markdown with llm-ui-------

const example = \`
## Example
 more text 123
 more text 123
⦅buttons,Button 1,Button2⦆
one more time
\`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        ...csvBlock(options),
        component: ButtonsComponent,
      },
    ],
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
    isStreamFinished,
  });
  return (
    <div>
      <pre>Prompt: {buttonsPrompt}</pre>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
`;
