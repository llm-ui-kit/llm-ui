import { LLMOutputBlock } from "@llm-ui/react";
import { jsonBlockLookBack } from "./lookback";
import { findCompleteJsonBlock, findPartialJsonBlock } from "./matchers";
import { JsonBlockOptions } from "./options";

export const jsonBlock = (options: JsonBlockOptions): LLMOutputBlock => {
  return {
    findCompleteMatch: findCompleteJsonBlock(options),
    findPartialMatch: findPartialJsonBlock(options),
    lookBack: jsonBlockLookBack(options),
    component: ({ blockMatch }) => (
      <div>
        <a href="https://llm-ui.com/docs/blocks/json">
          Docs to setup your own component
        </a>
        <pre>{blockMatch.output}</pre>
      </div>
    ),
  };
};
