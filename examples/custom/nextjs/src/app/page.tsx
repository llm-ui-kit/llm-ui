"use client";
import { customBlock, parseJson5 } from "@llm-ui/custom";
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
  t: z.literal("btn"),
  btns: z.array(z.object({ text: z.string() })),
});

const buttonsPartialSchema = buttonsSchema.deepPartial();

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
  const buttons = buttonsPartialSchema.parse(parseJson5(blockMatch.output));
  console.log("zzz", buttons);
  if (!buttons) {
    return undefined;
  }
  return (
    <div>
      {buttons?.btns?.map(
        (button, index) =>
          button?.text && <button key={index}>{button.text}</button>,
      )}
    </div>
  );
};

// -------Step 3: Render markdown with llm-ui-------

const example = `
## Example

【{t:"btn",btns:[{text:"Button 1"}, {text:"Button 2"}]}】
`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        ...customBlock("btn"),
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
      {blockMatches.map((blockMatch, index) => {
        const Component = blockMatch.block.component;
        return <Component key={index} blockMatch={blockMatch} />;
      })}
    </div>
  );
};

export default Example;
