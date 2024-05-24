import { LLMOutputBlock } from "@llm-ui/react";
import { customBlockLookBack } from "./lookback";
import { findCompleteCustomBlock, findPartialCustomBlock } from "./matchers";
import { CustomBlockOptions } from "./options";

export const customBlock = (
  type: string,
  userOptions?: Partial<CustomBlockOptions>,
): LLMOutputBlock => {
  return {
    findCompleteMatch: findCompleteCustomBlock(type, userOptions),
    findPartialMatch: findPartialCustomBlock(type, userOptions),
    lookBack: customBlockLookBack(type, userOptions),
    component: ({ blockMatch }) => (
      <div>
        <a href="https://llm-ui.com/docs/custom-blocks">
          Docs to setup your own component
        </a>
        <pre>{blockMatch.output}</pre>
      </div>
    ),
  };
};
