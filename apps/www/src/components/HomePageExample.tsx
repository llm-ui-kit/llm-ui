"use client";
import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import { cn } from "@/lib/utils";
import {
  buildShikiCodeBlockComponent,
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
  useLLMOutput,
  type LLMOutputBlock,
  type LLMOutputComponent,
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
import { Loader } from "./ui/Loader";
import { Slider } from "./ui/Slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { H2, Text } from "./ui/Text";

const example = `### Markdown block:

- [links](https://llm-ui.com)
- ~strikethrough~, *italic*, **bold**

### Codeblock block:

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
const Markdown: LLMOutputComponent = (props) => {
  return (
    <MarkdownComponent
      {...props}
      className={"prose dark:prose-invert"}
      components={{
        pre: ({ children }) => (
          <pre className="not-prose shiki">{children}</pre>
        ),
      }}
    />
  );
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

const CodeBlock = buildShikiCodeBlockComponent(shikiProps);

const CodeBlockContainer: React.FC<{
  code: string;
  isComplete: boolean;
  children: ReactNode;
}> = ({ code, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const Icon = isCopied ? Check : Copy;
  const text = isCopied ? "Copied" : "Copy";
  return (
    <div className="relative group my-4">
      <Button
        className={cn(
          "absolute top-3 end-3 min-w-24 !transition-opacity !ease-in !duration-150 group-hover:opacity-100 ",
          isCopied ? "opacity-100" : "opacity-0",
        )}
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

const codeBlockBlock: LLMOutputBlock = {
  isCompleteMatch: codeBlockCompleteMatcher(),
  isPartialMatch: codeBlockPartialMatcher(),
  lookBack: codeBlockLookBack(),
  component: ShikiComplete,
};

const readAhead = 10;
const lagBufferMs = 200;

const throttle: ThrottleFunction = ({
  isStreamFinished,
  visibleText,
  visibleTextAll,
  visibleTextLengthsAll,
  frameTime,
  frameTimePrevious,
  visibleTextIncrements,
}) => {
  const fps = 1000 / (frameTime - (frameTimePrevious ?? frameTime - 1000 / 30));

  const bufferSize = visibleTextAll.length - visibleText.length;

  // lookback 500 frames
  const lookbackFrames = Math.min(500, visibleTextLengthsAll.length);
  const recentVisibleTextLengths = visibleTextLengthsAll.slice(
    -1 * lookbackFrames,
  );
  const textAddedCount =
    recentVisibleTextLengths[recentVisibleTextLengths.length - 1] -
    recentVisibleTextLengths[0];

  const visibleTextPerRender = textAddedCount / lookbackFrames;
  const visibleTextPerMs = visibleTextPerRender / (1000 / fps);
  const lagBufferChars = lagBufferMs * visibleTextPerMs;

  let visibleTextIncrement = 0;
  const recentIncrements = visibleTextIncrements.slice(-20);

  const recentAverageIncrement =
    recentIncrements.reduce((a, b) => a + b, 0) / recentIncrements.length;
  if (isStreamFinished) {
    visibleTextIncrement = Math.max(1, Math.ceil(visibleTextPerRender));
  } else if (!isStreamFinished && bufferSize < readAhead) {
    visibleTextIncrement = 0;
  } else {
    const targetBufferSize = isStreamFinished ? 0 : readAhead + lagBufferChars;
    const isBehindTarget = bufferSize > targetBufferSize;
    const targetIncrement = isBehindTarget
      ? visibleTextPerRender * 3
      : (visibleTextPerRender * 1) / 3;

    visibleTextIncrement =
      recentAverageIncrement > targetIncrement
        ? Math.floor(targetIncrement)
        : Math.ceil(targetIncrement);
  }
  return {
    visibleTextIncrement,
  };
};

const SideBySideContainer: React.FC<{
  className?: string;
  header: ReactNode;
  children: ReactNode;
}> = ({ className, header, children }) => {
  return (
    <div className={cn(className, "overflow-x-hidden flex-1")}>
      {header}
      {children}
    </div>
  );
};

const CodeWithBackground: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <div className="flex flex-col rounded-lg bg-background p-6 min-h-[500px]">
    {children}
  </div>
);

type SideBySideTabsProps = {
  output: string;
  llmUi: ReactNode;
  className?: string;
};

const MobileSideBySideTabs: React.FC<SideBySideTabsProps> = (props) => (
  <SideBySideTabs {...props} isMobile />
);

const SideBySideTabs: React.FC<
  SideBySideTabsProps & {
    isMobile?: boolean;
  }
> = ({ className, output, llmUi, isMobile = false }) => {
  return (
    <Tabs defaultValue={isMobile ? "llm-ui" : "markdown"} className={className}>
      {isMobile && <TabsContent value="llm-ui">{llmUi}</TabsContent>}
      <TabsContent value="markdown">
        <CodeWithBackground>
          <Markdown isComplete={false} llmOutput={output} />
        </CodeWithBackground>
      </TabsContent>
      <TabsContent value="raw">
        <CodeWithBackground>
          <pre className="overflow-x-auto">{output}</pre>
        </CodeWithBackground>
      </TabsContent>
      <div className="flex flex-row items-center mt-2 justify-center md:justify-start">
        <TabsList>
          {isMobile && (
            <TabsTrigger value="llm-ui" className="md:hidden">
              llm-ui
            </TabsTrigger>
          )}
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
};

// Transforms the value of the slider to a delay multiplier
const transformSliderValue = (x: number): number => {
  if (x >= 0 && x <= 5) {
    return -1.8 * x + 10;
  } else if (x > 5 && x <= 10) {
    return -0.2 * x + 2;
  }
  // shouldn't happen
  return 1;
};

const Controls: React.FC<{
  className: string;
  onDelayMultiplier: (delayMultiplier: number) => void;
}> = ({ className, onDelayMultiplier }) => {
  return (
    <div className={cn(className, "flex flex-col items-center gap-4")}>
      <Text>Speed</Text>
      <Slider
        className="w-52"
        defaultValue={[5]}
        min={0}
        max={10}
        step={0.5}
        onValueChange={(newValue) => {
          onDelayMultiplier(transformSliderValue(newValue[0]));
        }}
      />
    </div>
  );
};

export const HomePageExample = () => {
  const [delayMultiplier, setDelayMultiplier] = useState(1);
  const { output, isStreamFinished, loopIndex } = useStreamFastSmooth(example, {
    loop: true,
    autoStart: true,
    loopDelayMs: 3000,
    delayMultiplier,
  });
  const { blockMatches, visibleText } = useLLMOutput({
    blocks: [codeBlockBlock],
    isStreamFinished,
    fallbackBlock: {
      component: Markdown,
      lookBack: markdownLookBack,
    },
    llmOutput: output,
    throttle,
    loopIndex,
  });
  const blocks = blockMatches.map((blockMatch, index) => {
    const Component = blockMatch.block.component;
    return (
      <Component
        key={index}
        llmOutput={blockMatch.match.outputAfterLookback}
        isComplete={isStreamFinished}
      />
    );
  });
  const llmUi = (
    <CodeWithBackground>
      {visibleText.length === 0 ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader />
        </div>
      ) : (
        blocks
      )}
    </CodeWithBackground>
  );
  return (
    <div>
      <div className="flex flex-row gap-8 h-[640px]">
        <SideBySideContainer
          header={
            <H2 className="mb-8 text-muted-foreground text-center">
              LLM Output
            </H2>
          }
        >
          <SideBySideTabs
            className="hidden md:block"
            output={output}
            llmUi={llmUi}
          />
          <MobileSideBySideTabs
            className="md:hidden"
            output={output}
            llmUi={llmUi}
          />
        </SideBySideContainer>
        <SideBySideContainer
          className="hidden md:block"
          header={
            <H2 className="mb-8 text-center">
              <span className="text-gradient_indigo-purple">llm-ui</span>✨
            </H2>
          }
        >
          {llmUi}
        </SideBySideContainer>
      </div>
      <Controls className="md:-mt-12" onDelayMultiplier={setDelayMultiplier} />
    </div>
  );
};
