"use client";
import { buttonsCsvBlock as createCsvButtonsBlock } from "@/components/examples/ButtonsCsv";
import { buttonsJsonBlock as createJsonButtonsBlock } from "@/components/examples/ButtonsJson";
import { codeBlockBlock } from "@/components/examples/CodeBlock";
import { Markdown } from "@/components/examples/Markdown";
import { markdownLookBack } from "@llm-ui/markdown";
import { throttleBasic, useLLMOutput } from "@llm-ui/react";

const buttonsJsonBlock = createJsonButtonsBlock();
const buttonsCsvBlock = createCsvButtonsBlock();

export const Message: React.FC<{
  message: string;
  isStreamFinished: boolean;
}> = ({ message, isStreamFinished }) => {
  const { blockMatches } = useLLMOutput({
    llmOutput: message,
    fallbackBlock: {
      component: Markdown,
      lookBack: markdownLookBack(),
    },
    blocks: [codeBlockBlock, buttonsJsonBlock, buttonsCsvBlock],
    isStreamFinished,
    throttle: throttleBasic({ targetBufferChars: 60 }),
  });

  // min-w-0 stops overflows
  return (
    <div className="flex flex-1 flex-col min-w-0">
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};
