import { LLMOutputBlock } from "@llm-ui/react";
import { jsonBlockLookBack } from "./lookback";
import { findCompleteJsonBlock, findPartialJsonBlock } from "./matchers";
import { JsonBlockOptions } from "./options";

export const jsonBlock = (
  type: string,
  userOptions?: Partial<JsonBlockOptions>,
): LLMOutputBlock => {
  return {
    findCompleteMatch: findCompleteJsonBlock(type, userOptions),
    findPartialMatch: findPartialJsonBlock(type, userOptions),
    lookBack: jsonBlockLookBack(type, userOptions),
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
