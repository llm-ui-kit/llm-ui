"use client";
import { buttonsBlock as createButtonsBlock } from "@/components/examples/Buttons";
import { codeBlockBlock } from "@/components/examples/CodeBlock";
import { Markdown } from "@/components/examples/Markdown";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput } from "@llm-ui/react";

const buttonsBlock = createButtonsBlock();

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
    blocks: [codeBlockBlock, buttonsBlock],
    isStreamFinished,
  });

  return (
    <div>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};
