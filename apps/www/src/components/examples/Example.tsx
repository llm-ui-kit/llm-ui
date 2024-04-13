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
import { NeverShrinkContainer } from "./NeverShrinkContainer";
import { throttle } from "./throttle";

const SideBySideContainer: React.FC<{
  className?: string;
  header: ReactNode;
  children: ReactNode;
}> = ({ className, header, children }) => {
  return (
    // todo: flex flex-1 flex-col items-stretch
    <div className={cn(className, "flex flex-1 flex-col items-stretch")}>
      {header}
      {children}
    </div>
  );
};

const OutputBackground: React.FC<{
  className?: string;
  children: ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn("bg-background text-left p-6 flex flex- flex-col", className)}
  >
    {children}
  </div>
);

type OutputTabsProps = {
  output: string;
  llmUi?: ReactNode;
  className?: string;
  backgroundClassName?: string;
};

type Tab = "markdown" | "raw" | "llm-ui";
const OutputTabs: React.FC<
  OutputTabsProps & {
    tabs?: Tab[];
  }
> = ({
  className,
  backgroundClassName,
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
        <TabsContent
          value="llm-ui"
          forceMount // keepMounted so we keep streaming the content
          className="data-[state=active]:block hidden"
        >
          {llmUi}
        </TabsContent>
      )}
      {showMarkdown && (
        // todo: flex flex-1
        <TabsContent value="markdown">
          {/* // todo: flex flex-1 */}
          <OutputBackground className={backgroundClassName}>
            <Markdown isComplete={false} llmOutput={output} />
          </OutputBackground>
        </TabsContent>
      )}
      {showRaw && (
        // todo: flex flex-1
        <TabsContent value="raw" className="flex flex-1">
          {/* // todo: flex flex-1 */}
          <OutputBackground className={backgroundClassName}>
            <pre className="overflow-x-auto not-shiki">{output}</pre>
          </OutputBackground>
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

export type ExampleProps = {
  className?: string;
  tabs: Tab[];
  backgroundClassName?: string;
  showPlayPause?: boolean;
  hideFirstLoop?: boolean;
} & UseExampleProps;

const LLMUI = ({
  isStreamFinished,
  isPlaying,
  loopIndex,
  backgroundClassName,
  hideFirstLoop = false,
  ...props
}: SetRequired<Partial<LLMOutputProps>, "isStreamFinished" | "llmOutput"> & {
  backgroundClassName?: string;
  isPlaying: boolean;
  hideFirstLoop?: boolean;
}) => {
  const { blockMatches, visibleText } = useLLMOutput({
    blocks: [codeBlockBlock],
    fallbackBlock: {
      component: Markdown,
      lookBack: markdownLookBack,
    },
    throttle,
    isStreamFinished,
    loopIndex,
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
    <NeverShrinkContainer>
      <OutputBackground className={backgroundClassName}>
        <div className={cn(hideFirstLoop && loopIndex === 0 && "invisible")}>
          {visibleText.length === 0 && isPlaying && loopIndex !== 0 ? (
            <div className="flex flex-1 justify-center items-center">
              <Loader />
            </div>
          ) : (
            blocks
          )}
        </div>
      </OutputBackground>
    </NeverShrinkContainer>
  );
};
type UseExampleProps = {
  example: string;
  options?: Partial<UseStreamWithProbabilitiesOptions>;
};
const useExample = ({ example, options = {} }: UseExampleProps) => {
  const [delayMultiplier, setDelayMultiplier] = useState(
    options.delayMultiplier ?? 1,
  );
  const result = useStreamFastSmooth(example, {
    loop: true,
    autoStart: true,
    autoStartDelayMs: 0,
    loopDelayMs: 3000,
    loopStartIndex: Number.MAX_SAFE_INTEGER,
    ...options,
    delayMultiplier,
  });
  return { ...result, setDelayMultiplier, delayMultiplier };
};

export const ExampleTabs: React.FC<ExampleProps> = ({
  example,
  tabs,
  className,
  backgroundClassName,
  options,
  showPlayPause = true,
  hideFirstLoop,
}) => {
  const {
    output,
    isStreamFinished,
    isPlaying,
    loopIndex,
    setDelayMultiplier,
    delayMultiplier,
    pause,
    start,
  } = useExample({ example, options });
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      backgroundClassName={backgroundClassName}
      isPlaying={isPlaying}
      hideFirstLoop={hideFirstLoop}
    />
  );
  return (
    <div className={cn("grid grid-cols-1", className)}>
      <OutputTabs
        // todo: md:flex flex-grow
        className="hidden md:block"
        output={output}
        llmUi={llmUi}
        tabs={tabs}
        backgroundClassName={backgroundClassName}
      />
      <div className="flex flex-col items-center">
        <Controls
          className="md:-mt-6"
          delayMultiplier={delayMultiplier}
          onDelayMultiplier={setDelayMultiplier}
          onPause={pause}
          onStart={start}
          showPlayPause={showPlayPause}
          isPlaying={isPlaying}
        />
      </div>
    </div>
  );
};

export type ExampleSideBySideProps = ExampleProps & {
  showHeaders?: boolean;
};

export const ExampleSideBySide: React.FC<ExampleSideBySideProps> = ({
  className,
  showHeaders = false,
  tabs = ["llm-ui", "markdown", "raw"],
  backgroundClassName,
  showPlayPause = true,
  hideFirstLoop,
  ...props
}) => {
  if (!tabs.includes("llm-ui")) {
    throw new Error("llm-ui tab is required for ExampleSideBySide");
  }
  const {
    output,
    isStreamFinished,
    pause,
    start,
    isPlaying,
    loopIndex,
    setDelayMultiplier,
    delayMultiplier,
  } = useExample(props);
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      backgroundClassName={backgroundClassName}
      isPlaying={isPlaying}
      hideFirstLoop={hideFirstLoop}
    />
  );
  return (
    <div className={className}>
      <NeverShrinkContainer className="grid md:grid-cols-2 grid-cols-1 gap-8">
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
            // todo:             className="hidden md:flex flex-1"

            className="hidden md:block"
            output={output}
            tabs={tabs.filter((tab) => tab !== "llm-ui")}
            backgroundClassName={backgroundClassName}
          />
          <OutputTabs
            className="md:hidden"
            output={output}
            llmUi={llmUi}
            tabs={tabs}
            backgroundClassName={backgroundClassName}
          />
        </SideBySideContainer>
        <SideBySideContainer
          className="hidden md:block"
          header={
            showHeaders && (
              <H2 className="mb-8 text-center">
                <span className="font-black text-gradient_indigo-purple">
                  llm-ui
                </span>{" "}
                ✨
              </H2>
            )
          }
        >
          {llmUi}
        </SideBySideContainer>
      </NeverShrinkContainer>
      <Controls
        className={tabs.length > 2 ? "md:-mt-8" : "mt-4"}
        delayMultiplier={delayMultiplier}
        onDelayMultiplier={setDelayMultiplier}
        isPlaying={isPlaying}
        showPlayPause={showPlayPause}
        onPause={pause}
        onStart={start}
      />
    </div>
  );
};
