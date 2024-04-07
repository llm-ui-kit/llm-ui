import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import {
  buildShikiCompleteCodeBlock,
  buildShikiPartialCodeBlock,
  matchCompleteMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
} from "@llm-ui/code-block";
import {
  allLangs,
  allLangsAlias,
} from "@llm-ui/code-block/shikiBundles/allLangs";
import { MarkdownComponent } from "@llm-ui/markdown";
import {
  LLMOutput,
  type LLMOutputComponent,
  type LLMOutputReactComponent,
} from "llm-ui/components";
import type { ShikiCodeBlockComponent } from "node_modules/@llm-ui/code-block/src/shikiComponent";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";

const example = `
# llm-ui

> Markdown support

Links: [llm-ui.com](https://llm-ui.com), ~strikethrough~, *italic*, **bold**

#### Code block
\`\`\`typescript
import { LLMOutput } from "llm-ui/components";

console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
console.log('Hello llm-ui');
\`\`\`
`;

const Markdown: LLMOutputReactComponent = ({ llmOutput }) => {
  return (
    <MarkdownComponent
      llmOutput={llmOutput}
      className={"prose dark:prose-invert"}
    />
  );
};

const shikiProps = {
  highlighterOptions: {
    langs: allLangs,
    langAlias: allLangsAlias,
    themes: [githubLight, githubDark],
    loadWasm: getWasm,
  },
  codeToHtmlProps: { themes: { light: "github-light", dark: "github-dark" } },
};

const CompleteCodeBlock = buildShikiCompleteCodeBlock(shikiProps);
const PartialCodeBlock = buildShikiPartialCodeBlock(shikiProps);

const ShikiComplete: ShikiCodeBlockComponent = (props) => (
  <CompleteCodeBlock className="py-4" {...props} />
);

const ShikiPartial: ShikiCodeBlockComponent = (props) => (
  <PartialCodeBlock className="py-4" {...props} />
);

const codeBlockComponent: LLMOutputComponent = {
  isCompleteMatch: matchCompleteMarkdownCodeBlock(),
  isPartialMatch: matchPartialMarkdownCodeBlock(),
  completeComponent: ShikiComplete,
  partialComponent: ShikiPartial,
};

export const HomePageExample = () => {
  const { output } = useStreamFastSmooth(example, {
    loop: false,
    autoStart: true,
    loopDelayMs: 3000,
  });

  return (
    <LLMOutput
      components={[codeBlockComponent]}
      fallbackComponent={Markdown}
      llmOutput={output}
    />
  );
};
