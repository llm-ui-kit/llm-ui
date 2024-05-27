"use client";
import { customBlock, customBlockPrompt, parseJson5 } from "@llm-ui/custom";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  useLLMOutput,
  useStreamExample,
  type LLMOutputComponent,
} from "@llm-ui/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import z from "zod";

const buttonsSchema = z.object({
  type: z.literal("buttons"),
  buttons: z.array(z.object({ text: z.string() })),
});

const buttonsPrompt = customBlockPrompt({
  name: "buttons",
  schema: buttonsSchema,
  examples: [
    { type: "buttons", buttons: [{ text: "Button 1" }, { text: "Button 2" }] },
  ],
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
  const isVisible = blockMatch.isVisible;
  if (!isVisible) {
    return null;
  }
  const buttons = buttonsSchema.parse(parseJson5(blockMatch.output));
  if (!buttons) {
    return undefined;
  }
  return (
    <div>
      {buttons?.buttons?.map(
        (button, index) =>
          button?.text && <button key={index}>{button.text}</button>,
      )}
    </div>
  );
};

// -------Step 3: Render markdown with llm-ui-------

const example = `
## Example
 more text 123
 more text 123
【{type:"buttons",buttons:[{text:"Button 1"}, {text:"Button 2"}]}】
one more time
`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        ...customBlock("buttons"),
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
