"use client";
import { useStreamFastSmooth } from "@/hooks/useLLMExamples";
import { cn } from "@/lib/utils";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput } from "llm-ui/components";
import type { UseStreamWithProbabilitiesOptions } from "llm-ui/hooks";
import { useState, type ReactNode } from "react";
import { Loader } from "../ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { H2 } from "../ui/Text";
import { codeBlockBlock } from "./CodeBlock";
import { Controls } from "./Controls";
import { Markdown } from "./Markdown";
import { example } from "./examples";
import { throttle } from "./throttle";

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

type OutputTabsProps = {
  output: string;
  llmUi?: ReactNode;
  className?: string;
};

const OutputTabs: React.FC<
  OutputTabsProps & {
    isMobile?: boolean;
  }
> = ({ className, output, llmUi, isMobile = false }) => {
  return (
    <Tabs defaultValue={isMobile ? "llm-ui" : "markdown"} className={className}>
      {isMobile && llmUi && <TabsContent value="llm-ui">{llmUi}</TabsContent>}
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

export const Example = ({
  delayMultiplier: delayMultiplierProp,
  ...props
}: Partial<UseStreamWithProbabilitiesOptions>) => {
  const [delayMultiplier, setDelayMultiplier] = useState(delayMultiplierProp);
  const { output, isStreamFinished, loopIndex } = useStreamFastSmooth(example, {
    loop: true,
    autoStart: true,
    loopDelayMs: 3000,
    ...props,
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
          <OutputTabs className="hidden md:block" output={output} />
          <OutputTabs
            isMobile
            className="md:hidden"
            output={output}
            llmUi={llmUi}
          />
        </SideBySideContainer>
        <SideBySideContainer
          className="hidden md:block"
          header={
            <H2 className="mb-8 text-center">
              <span className="text-gradient_indigo-purple">llm-ui</span> ✨
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
