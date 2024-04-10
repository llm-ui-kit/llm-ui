import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import {
  buildShikiCodeBlock,
  codeBlockCompleteMatcher,
  codeBlockLookBack,
  loadHighlighter,
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
import { Check, Copy } from "lucide-react";
import { codeBlockPartialMatcher } from "node_modules/@llm-ui/code-block/src/matchers";
import type {
  ShikiCodeBlockComponent,
  ShikiProps,
} from "node_modules/@llm-ui/code-block/src/shikiComponent";
import type { ThrottleFunction } from "node_modules/llm-ui/src/components/LLMOutput/types";
import { useState, type ReactNode } from "react";
import { getHighlighterCore } from "shiki/core";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import getWasm from "shiki/wasm";
import { Button } from "./ui/Button";

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

const CodeBlock = buildShikiCodeBlock(shikiProps);

const CodeBlockContainer: React.FC<{
  code: string;
  isComplete: boolean;
  children: ReactNode;
}> = ({ code, isComplete, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const Icon = isCopied ? Check : Copy;
  const text = isCopied ? "Copied" : "Copy";
  return (
    <div className="relative group my-4">
      <Button
        className="absolute top-2 end-2 min-w-24 !transition-opacity !ease-in !duration-150 group-hover:opacity-100 opacity-0"
        size={"sm"}
        variant={"secondary"}
        onClick={() => {
          navigator.clipboard.writeText(code);
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 1400);
        }}
      >
        <Icon className="mr-2 h-4 w-4" />
        {text}
      </Button>
      {children}
    </div>
  );
};

const ShikiComplete: ShikiCodeBlockComponent = (props) => {
  return (
    <CodeBlockContainer code={props.llmOutput} isComplete>
      <CodeBlock {...props} />
    </CodeBlockContainer>
  );
};

const codeBlockComponent: LLMOutputComponent = {
  isCompleteMatch: codeBlockCompleteMatcher(),
  isPartialMatch: codeBlockPartialMatcher(),
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
      (!isStreamFinished && bufferSize < 10) || timeInMsSinceLastRender < 50,
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
