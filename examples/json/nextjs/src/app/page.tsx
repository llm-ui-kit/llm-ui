"use client";
import { jsonBlock, jsonBlockPrompt, parseJson5 } from "@llm-ui/json";
import { markdownLookBack } from "@llm-ui/markdown";
import {
  useLLMOutput,
  useStreamExample,
  type LLMOutputComponent,
} from "@llm-ui/react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import z from "zod";

const options = {
  type: "buttons",
};

const buttonsSchema = z.object({
  type: z.literal("buttons"),
  buttons: z.array(z.object({ text: z.string() })),
});

const buttonsPrompt = jsonBlockPrompt({
  name: "buttons",
  schema: buttonsSchema,
  examples: [
    { type: "buttons", buttons: [{ text: "Button 1" }, { text: "Button 2" }] },
  ],
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
  const { data: buttons, error } = buttonsSchema.safeParse(
    parseJson5(blockMatch.output),
  );

  if (error) {
    return <div>{error.toString()}</div>;
  }
  return (
    <div>
      {buttons.buttons.map((button, index) => (
        <button key={index}>{button.text}</button>
      ))}
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
        ...jsonBlock(options),
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
