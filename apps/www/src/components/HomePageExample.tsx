import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import {
  buildShikiCompleteCodeBlock,
  buildShikiPartialCodeBlock,
  codeBlockLookBack,
  loadHighlighter,
  matchCompleteCodeBlock,
  matchPartialCodeBlock,
} from "@llm-ui/code-block";
import {
  allLangs,
  allLangsAlias,
} from "@llm-ui/code-block/shikiBundles/allLangs";
import { MarkdownComponent, markdownLookBack } from "@llm-ui/markdown";
import {
  LLMOutput,
  type LLMOutputComponent,
  type LLMOutputReactComponent,
} from "llm-ui/components";
import type {
  ShikiCodeBlockComponent,
  ShikiProps,
} from "node_modules/@llm-ui/code-block/src/shikiComponent";
import type { ThrottleFunction } from "node_modules/llm-ui/src/components/LLMOutput/types";
import { getHighlighterCore } from "shiki/core";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";

const example = `
### Markdown support ✅


Supports: [links](https://llm-ui.com), ~strikethrough~, *italic*, **bold**

#### Code blocks:

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
const Markdown: LLMOutputReactComponent = (props) => {
  return <MarkdownComponent {...props} className={"prose dark:prose-invert"} />;
};

const shikiProps: ShikiProps = {
  highlighter: loadHighlighter(
    getHighlighterCore({
      langs: allLangs,
      langAlias: allLangsAlias,
      themes: [githubLight, githubDark],
      loadWasm: getWasm,
    }),
  ),
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
  isCompleteMatch: matchCompleteCodeBlock(),
  isPartialMatch: matchPartialCodeBlock(),
  lookBack: codeBlockLookBack(),
  component: ShikiComplete,
};

const throttle: ThrottleFunction = ({
  outputAll,
  outputRendered,
  timeInMsSinceLastRender,
  isStreamFinished,
  visibleText,
}) => {
  const bufferSize = outputAll.length - outputRendered.length;
  return {
    skip:
      (!isStreamFinished && bufferSize < 10) || timeInMsSinceLastRender < 250,
    visibleTextLengthTarget: visibleText.length + 1,
  };
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
      isFinished={output === example}
      fallbackComponent={{ component: Markdown, lookBack: markdownLookBack }}
      llmOutput={output}
      throttle={throttle}
    />
  );
};
