import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import { cn } from "@/lib/utils";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputProps } from "llm-ui/components";
import type { UseStreamWithProbabilitiesOptions } from "llm-ui/hooks";
import { useState, type ReactNode } from "react";
import type { SetRequired } from "type-fest";
import { Loader } from "../ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { H2 } from "../ui/Text";
import { codeBlockBlock } from "./CodeBlock";
import { Controls } from "./Controls";
import { Markdown } from "./Markdown";
import { throttle } from "./throttle";

const SideBySideContainer: React.FC<{
  className?: string;
  header: ReactNode;
  children: ReactNode;
}> = ({ className, header, children }) => {
  return (
    <div className={cn(className, "flex-1 ")}>
      {header}
      {children}
    </div>
  );
};

const CodeWithBackground: React.FC<{ children: ReactNode; height: number }> = ({
  height,
  children,
}) => (
  <div
    style={{ height }}
    className="rounded-lg bg-background text-left p-6 flex flex- flex-col"
  >
    {children}
  </div>
);

type OutputTabsProps = {
  output: string;
  llmUi?: ReactNode;
  className?: string;
  height: number;
};

type Tab = "markdown" | "raw" | "llm-ui";
const OutputTabs: React.FC<
  OutputTabsProps & {
    tabs?: Tab[];
  }
> = ({
  className,
  height,
  output,
  llmUi,
  tabs = ["llm-ui", "markdown", "raw"],
}) => {
  const showMarkdown = tabs.includes("markdown");
  const showRaw = tabs.includes("raw");
  const showLlmUi = tabs.includes("llm-ui") && llmUi;
  const defaultValue = tabs[0];
  return (
    <Tabs defaultValue={defaultValue} className={className}>
      {showLlmUi && (
        <TabsContent value="llm-ui">
          <div style={{ height }}>{llmUi}</div>
        </TabsContent>
      )}
      {showMarkdown && (
        <TabsContent value="markdown">
          <CodeWithBackground height={height}>
            <Markdown isComplete={false} llmOutput={output} />
          </CodeWithBackground>
        </TabsContent>
      )}
      {showRaw && (
        <TabsContent value="raw">
          <CodeWithBackground height={height}>
            <pre className="overflow-x-auto">{output}</pre>
          </CodeWithBackground>
        </TabsContent>
      )}
      {tabs.length > 1 && (
        <div className="flex flex-row items-center mt-2 justify-center md:justify-start">
          <TabsList>
            {showLlmUi && <TabsTrigger value="llm-ui">llm-ui</TabsTrigger>}
            {showMarkdown && (
              <TabsTrigger value="markdown">markdown</TabsTrigger>
            )}
            {showRaw && <TabsTrigger value="raw">raw</TabsTrigger>}
          </TabsList>
        </div>
      )}
    </Tabs>
  );
};

type ExampleProps = {
  outputHeight: number;
  tabs: Tab[];
} & UseExampleProps;

const LLMUI = ({
  isStreamFinished,
  height,
  ...props
}: SetRequired<Partial<LLMOutputProps>, "isStreamFinished" | "llmOutput"> & {
  height: number;
}) => {
  const { blockMatches, visibleText } = useLLMOutput({
    blocks: [codeBlockBlock],
    fallbackBlock: {
      component: Markdown,
      lookBack: markdownLookBack,
    },
    throttle,
    isStreamFinished,
    ...props,
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
  return (
    <CodeWithBackground height={height}>
      {visibleText.length === 0 ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader />
        </div>
      ) : (
        blocks
      )}
    </CodeWithBackground>
  );
};
type UseExampleProps = {
  example: string;
  options?: Partial<UseStreamWithProbabilitiesOptions>;
};
const useExample = ({ example, options = {} }: UseExampleProps) => {
  const [delayMultiplier, setDelayMultiplier] = useState(
    options.delayMultiplier,
  );
  const result = useStreamFastSmooth(example, {
    loop: false,
    autoStart: true,
    loopDelayMs: 3000,
    ...options,
    delayMultiplier,
  });
  return { ...result, setDelayMultiplier, delayMultiplier };
};

export const ExampleTabs = ({
  example,
  outputHeight,
  tabs,
  options,
}: ExampleProps) => {
  const {
    output,
    isStreamFinished,
    loopIndex,
    setDelayMultiplier,
    delayMultiplier,
  } = useExample({ example, options });
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      height={outputHeight}
    />
  );
  return (
    <div className="grid grid-cols-1">
      <OutputTabs
        className="hidden md:block"
        output={output}
        llmUi={llmUi}
        tabs={tabs}
        height={outputHeight}
      />
      <div className="flex flex-col items-center">
        <Controls
          className="md:-mt-6"
          initialDelayMultiplier={delayMultiplier}
          onDelayMultiplier={setDelayMultiplier}
        />
      </div>
    </div>
  );
};

export const ExampleSideBySide = ({
  className,
  showHeaders = false,
  tabs = ["markdown", "raw"],
  outputHeight,
  ...props
}: ExampleProps & { className?: string; showHeaders?: boolean }) => {
  const {
    output,
    isStreamFinished,
    loopIndex,
    setDelayMultiplier,
    delayMultiplier,
  } = useExample(props);
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      height={outputHeight}
    />
  );
  return (
    <div className={className}>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
        <SideBySideContainer
          header={
            showHeaders && (
              <H2 className="mb-8 text-muted-foreground text-center">
                LLM Output
              </H2>
            )
          }
        >
          <OutputTabs
            className="hidden md:block"
            output={output}
            tabs={tabs}
            height={outputHeight}
          />
          <OutputTabs
            className="md:hidden"
            output={output}
            llmUi={llmUi}
            tabs={["llm-ui", ...tabs]}
            height={outputHeight}
          />
        </SideBySideContainer>
        <SideBySideContainer
          className="hidden md:block"
          header={
            showHeaders && (
              <H2 className="mb-8 text-center">
                <span className="text-gradient_indigo-purple">llm-ui</span> ✨
              </H2>
            )
          }
        >
          {llmUi}
        </SideBySideContainer>
      </div>
      <Controls
        className={tabs.length > 1 ? "md:-mt-4" : "mt-4"}
        initialDelayMultiplier={delayMultiplier}
        onDelayMultiplier={setDelayMultiplier}
      />
    </div>
  );
};
