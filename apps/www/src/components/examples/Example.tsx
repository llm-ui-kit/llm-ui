import { cn } from "@/lib/utils";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputProps } from "llm-ui/components";
import {
  stringToTokenArray,
  useStreamTokenArray,
  type TokenWithDelay,
  type UseStreamTokenArrayOptions,
  type UseStreamWithProbabilitiesOptions,
} from "llm-ui/hooks";
import { throttleBasic } from "llm-ui/throttle";
import React, { useState, type ReactNode } from "react";
import type { SetRequired } from "type-fest";
import { Loader } from "../ui/custom/Loader";
import { H2 } from "../ui/custom/Text";
import { buttonsBlock } from "./Buttons";
import { codeBlockBlock } from "./CodeBlock";
import { Controls } from "./Controls";
import { Markdown } from "./Markdown";
import { NeverShrinkContainer } from "./NeverShrinkContainer";
import { defaultExampleProbs } from "./contants";
import { getThrottle } from "./throttle";
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
  isVisible: boolean;
};

const OutputTabs: React.FC<OutputTabsProps> = ({
  output,
  llmUi,
  tabs = ["llm-ui", "markdown", "raw"],
  className,
  tabIndex,
  isVisible,
}) => {
  return (
    <OutputBackground className={className}>
      {tabs.map((tab, index) => {
        const isActive = index === tabIndex;
        return (
          <>
            {tab === "markdown" && isActive && (
              <Markdown
                className={cn(!isVisible && "invisible")}
                isComplete={false}
                llmOutput={output}
              />
            )}
            {tab === "raw" && isActive && (
              <pre
                className={cn(
                  "not-shiki raw-example whitespace-pre-wrap",
                  !isVisible && "invisible",
                )}
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

type ExampleCommonProps = {
  className?: string;
  tabs: Tab[];
  backgroundClassName?: string;
  showPlayPause?: boolean;
  hideFirstLoop?: boolean;
  throttle?: "basic" | "buffer";
};

export type ExampleTokenArrayProps = ExampleCommonProps &
  UseExampleTokenArrayProps;
export type ExampleProps = ExampleCommonProps & UseExampleProbsProps;

const LLMUI = ({
  isStreamFinished,
  isPlaying,
  loopIndex,
  hideFirstLoop = false,
  throttle = throttleBasic(),
  ...props
}: SetRequired<Partial<LLMOutputProps>, "isStreamFinished" | "llmOutput"> & {
  isPlaying: boolean;
  hideFirstLoop?: boolean;
}) => {
  const {
    blockMatches,
    visibleText,
    loopIndex: outputLoopIndex,
  } = useLLMOutput({
    blocks: [codeBlockBlock, buttonsBlock],
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
    <div
      className={cn(
        "flex flex-1 flex-col overflow-x-auto",
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
  );
};

type UseExampleProbsProps = {
  example: string;
  options?: Partial<UseStreamWithProbabilitiesOptions>;
};

type UseExampleTokenArrayProps = {
  tokenArray: TokenWithDelay[];
  options?: Partial<UseStreamTokenArrayOptions>;
};

const useExampleTokenArray = ({
  tokenArray,
  options = {},
}: UseExampleTokenArrayProps) => {
  const [delayMultiplier, setDelayMultiplier] = useState(
    options.delayMultiplier ?? 1,
  );
  const result = useStreamTokenArray(tokenArray, {
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

export const ExampleTabsTokenArray: React.FC<ExampleTokenArrayProps> = ({
  tokenArray,
  tabs,
  className,
  backgroundClassName,
  options,
  throttle,
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
  } = useExampleTokenArray({ tokenArray, options });
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      isPlaying={isPlaying}
      hideFirstLoop={hideFirstLoop}
      throttle={getThrottle(throttle)}
    />
  );
  return (
    <div className={cn("grid grid-cols-1", className)}>
      <NeverShrinkContainer className="flex flex-1">
        <OutputTabs
          isVisible={!hideFirstLoop || loopIndex !== 0}
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
type SideBySideProps = {
  showHeaders?: boolean;
};
export type ExampleSideBySideTokenArrayProps = ExampleTokenArrayProps &
  SideBySideProps;

export type ExampleSideBySideProps = ExampleProps & SideBySideProps;

export const ExampleSideBySideTokenArray: React.FC<
  ExampleSideBySideTokenArrayProps
> = ({
  className,
  showHeaders = false,
  tabs = ["llm-ui", "markdown", "raw"],
  backgroundClassName,
  showPlayPause = true,
  hideFirstLoop,
  throttle,
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
  } = useExampleTokenArray(props);
  const llmUi = (
    <LLMUI
      isStreamFinished={isStreamFinished}
      llmOutput={output}
      loopIndex={loopIndex}
      isPlaying={isPlaying}
      hideFirstLoop={hideFirstLoop}
      throttle={getThrottle(throttle)}
    />
  );
  const isVisible = !hideFirstLoop || loopIndex !== 0;
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
            isVisible={isVisible}
            className={cn(
              "hidden md:flex border-r-2 border-background-200 rounded-tl-lg",
              backgroundClassName,
            )}
            output={output}
            tabs={desktopTabs}
            tabIndex={desktopTabIndex}
          />
          <OutputTabs
            isVisible={isVisible}
            className={cn(backgroundClassName, "flex md:hidden rounded-t-lg")}
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
          <OutputBackground className={backgroundClassName}>
            {llmUi}
          </OutputBackground>
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

const getProbOptions = (
  options: Partial<UseStreamWithProbabilitiesOptions> | undefined,
) => ({
  ...defaultExampleProbs,
  ...(options ?? {}),
});

export const ExampleSideBySide: React.FC<ExampleSideBySideProps> = ({
  example,
  ...props
}) => {
  const options = getProbOptions(props.options);
  return (
    <ExampleSideBySideTokenArray
      tokenArray={stringToTokenArray(example, options)}
      {...props}
      options={options}
    />
  );
};

export const ExampleTabs: React.FC<ExampleProps> = ({ example, ...props }) => {
  const options = getProbOptions(props.options);
  return (
    <ExampleTabsTokenArray
      tokenArray={stringToTokenArray(example, options)}
      {...props}
      options={options}
    />
  );
};
