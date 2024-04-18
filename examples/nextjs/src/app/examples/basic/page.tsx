"use client";
import { markdownFallbackBlock } from "@llm-ui/markdown";
import { useLLMOutput } from "llm-ui/core";
import { useStreamExample } from "llm-ui/hooks";
import { throttleBasic } from "llm-ui/throttle";

const example = `
## Example

**Hello llm-ui!** this is [markdown](https://markdownguide.org)
`;

const Example = () => {
  const { isStreamFinished, loopIndex, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [],
    fallbackBlock: markdownFallbackBlock,
    throttle: throttleBasic(),
    isStreamFinished,
    loopIndex, // only needed for useStreamExample
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

export default Example;
