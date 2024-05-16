"use client";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  useLLMOutput,
  useStreamExample,
  type LLMOutputComponent,
} from "@llm-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// -------Step 1: Create a markdown component-------

// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const markdown = blockMatch.output;
  return (
    <ReactMarkdown className={"markdown"} remarkPlugins={[remarkGfm]}>
      {markdown}
    </ReactMarkdown>
  );
};

// -------Step 2: Render markdown with llm-ui-------

const example = `
## Example

**Hello llm-ui!** this is [markdown](https://markdownguide.org)
`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [],
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
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

export default Example;
