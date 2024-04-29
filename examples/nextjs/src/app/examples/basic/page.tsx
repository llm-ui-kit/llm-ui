"use client";
import { markdownLookBack } from "@llm-ui/markdown";
import { useLLMOutput, type LLMOutputComponent } from "@llm-ui/react/core";
import { useStreamExample } from "@llm-ui/react/examples";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";

// Customize this component with your own styling
const MarkdownComponent: LLMOutputComponent<Options> = ({
  blockMatch,
  ...props
}) => {
  const markdown = blockMatch.output;
  return (
    <ReactMarkdown
      className="prose prose-invert"
      {...props}
      remarkPlugins={[...(props.remarkPlugins ?? []), remarkGfm]}
    >
      {markdown}
    </ReactMarkdown>
  );
};

const example = `
## Example

**Hello llm-ui!** this is [markdown](https://markdownguide.org)


`.repeat(10);

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
