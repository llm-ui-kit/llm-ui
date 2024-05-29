"use client";
import { csvBlock, csvBlockPrompt, parseCsv } from "@llm-ui/csv";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  useLLMOutput,
  useStreamExample,
  type LLMOutputComponent,
} from "@llm-ui/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const options = {
  type: "buttons",
};

const buttonsPrompt = csvBlockPrompt({
  name: "buttons",
  examples: [["Button 1", "Button 2"]],
  options,
});
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

// -------Step 2: Create a buttons component-------

// Customize this component with your own styling
const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) {
    return null;
  }
  const [_type, ...buttons] = parseCsv(blockMatch.output, options);

  return (
    <div>
      {buttons.map((buttonText, index) => (
        <button key={index}>{buttonText}</button>
      ))}
    </div>
  );
};

// -------Step 3: Render markdown with llm-ui-------

const example = `
## Example
 more text 123
 more text 123
⦅buttons,Button 1,Button2⦆
one more time
`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        ...csvBlock(options),
        component: ButtonsComponent,
      },
    ],
    fallbackBlock: {
      component: MarkdownComponent,
      lookBack: markdownLookBack(),
    },
    isStreamFinished,
  });
  return (
    <div>
      <pre>Prompt: {buttonsPrompt}</pre>
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
