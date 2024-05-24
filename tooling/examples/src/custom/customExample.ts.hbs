"use client";
import {
  buttonsLookBack,
  findCompleteButtons,
  findPartialButtons,
  parseCompleteButtons,
} from "@llm-ui/buttons";
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

// -------Step 2: Create a buttons component-------

// Customize this component with your own styling
const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  const buttons = parseCompleteButtons(blockMatch.output);
  if (!buttons) {
    return undefined;
  }
  return (
    <div>
      {buttons.map((button, index) => (
        <button key={index}>{button}</button>
      ))}
    </div>
  );
};

// -------Step 3: Render markdown with llm-ui-------

const example = `
## Example

<buttons><button>Button 1</button><button>Button 2</button></buttons>
`;

const Example = () => {
  const { isStreamFinished, output } = useStreamExample(example);

  const { blockMatches } = useLLMOutput({
    llmOutput: output,
    blocks: [
      {
        component: ButtonsComponent,
        findPartialMatch: findPartialButtons(),
        findCompleteMatch: findCompleteButtons(),
        lookBack: buttonsLookBack(),
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
