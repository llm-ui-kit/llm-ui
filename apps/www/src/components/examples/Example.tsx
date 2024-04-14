import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import { cn } from "@/lib/utils";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputProps } from "llm-ui/components";
import type { UseStreamWithProbabilitiesOptions } from "llm-ui/hooks";
import { useState, type ReactNode } from "react";
import type { SetRequired } from "type-fest";
import { Loader } from "../ui/Loader";
import { H2 } from "../ui/Text";
import { codeBlockBlock } from "./CodeBlock";
import { Controls } from "./Controls";
import { Markdown } from "./Markdown";
import { NeverShrinkContainer } from "./NeverShrinkContainer";
import { throttle } from "./throttle";
import type { Tab } from "./types";

const SideBySideContainer: React.FC<{
  className?: string;
  header: ReactNode;
  children: ReactNode;
}> = ({ className, header, children }) => {
  return (
    <div className={cn("flex flex-1 flex-col items-stretch", className)}>
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
    className={cn(
      "bg-background text-left p-6 flex flex-col flex-1 overflow-x-auto",
      className,
    )}
  >
    {children}
  </div>
);

type OutputTabsProps = {
  output: string;
  llmUi?: ReactNode;
  className?: string;
  tabs?: Tab[];
  tabIndex: number;
};

const OutputTabs: React.FC<OutputTabsProps> = ({
  output,
  llmUi,
  tabs = ["llm-ui", "markdown", "raw"],
  className,
  tabIndex,
}) => {
  return (
    <OutputBackground className={className}>
      {tabs.map((tab, index) => {
        const isActive = index === tabIndex;
        return (
          <>
            {tab === "markdown" && isActive && (
              <Markdown isComplete={false} llmOutput={output} />
            )}
            {tab === "raw" && isActive && (
              <pre
                className="not-shiki raw-example "
                style={{ backgroundColor: "inherit" }}
              >
                {output}
              </pre>
            )}
            {tab === "llm-ui" && (
              // Always render llm-ui so we keep streaming the content and don't restart
              <div
                className={cn("flex flex-1", index !== tabIndex && "hidden")}
              >
                {llmUi}
              </div>
            )}
          </>
        );
      })}
    </OutputBackground>
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
  const {
    blockMatches,
    visibleText,
    loopIndex: outputLoopIndex,
  } = useLLMOutput({
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
    <OutputBackground className={backgroundClassName}>
      <div
        className={cn(
          "flex flex-1 flex-col",
          hideFirstLoop && outputLoopIndex === 0 && "invisible",
        )}
      >
        {visibleText.length === 0 && isPlaying && outputLoopIndex !== 0 ? (
          <div className="flex flex-1 justify-center items-center">
            <Loader />
          </div>
        ) : (
          blocks
        )}
      </div>
    </OutputBackground>
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
    autoStartDelayMs: 500,
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
  const [tabIndex, setTabIndex] = useState(0);

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
      <NeverShrinkContainer className="flex flex-1">
        <OutputTabs
          className={cn(backgroundClassName, "flex flex-1 rounded-t-lg")}
          output={output}
          llmUi={llmUi}
          tabs={tabs}
          tabIndex={tabIndex}
        />
      </NeverShrinkContainer>
      <Controls
        className={""}
        delayMultiplier={delayMultiplier}
        onDelayMultiplier={setDelayMultiplier}
        onPause={pause}
        onStart={start}
        showPlayPause={showPlayPause}
        isPlaying={isPlaying}
        desktopTabs={tabs}
        onDesktopTabIndexChange={setTabIndex}
        mobileTabs={tabs}
        onMobileTabIndexChange={setTabIndex}
      />
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
  const mobileTabs = tabs;
  const desktopTabs = tabs.filter((tab) => tab !== "llm-ui");

  const [mobileTabIndex, setMobileTabIndex] = useState(0);
  const [desktopTabIndex, setDesktopTabIndex] = useState(0);
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
      backgroundClassName={cn(
        "rounded-tr-lg overflow-clip",
        backgroundClassName,
      )}
      isPlaying={isPlaying}
      hideFirstLoop={hideFirstLoop}
    />
  );
  return (
    <div className={className}>
      <NeverShrinkContainer className="grid md:grid-cols-2 grid-cols-1 ">
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
            className={cn(
              backgroundClassName,
              "hidden md:flex border-r-2 border-background-200 rounded-tl-lg overflow-clip",
            )}
            output={output}
            tabs={desktopTabs}
            tabIndex={desktopTabIndex}
          />
          <OutputTabs
            className={cn(
              backgroundClassName,
              "md:hidden rounded-t-lg overflow-clip",
            )}
            output={output}
            llmUi={llmUi}
            tabs={mobileTabs}
            tabIndex={mobileTabIndex}
          />
        </SideBySideContainer>
        <SideBySideContainer
          className="hidden md:flex"
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
        delayMultiplier={delayMultiplier}
        onDelayMultiplier={setDelayMultiplier}
        isPlaying={isPlaying}
        showPlayPause={showPlayPause}
        onPause={pause}
        onStart={start}
        desktopTabs={desktopTabs}
        mobileTabs={mobileTabs}
        onDesktopTabIndexChange={setDesktopTabIndex}
        onMobileTabIndexChange={setMobileTabIndex}
      />
    </div>
  );
};
