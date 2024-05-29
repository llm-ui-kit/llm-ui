import { LLMOutputBlock } from "@llm-ui/react";
import { csvBlockLookBack } from "./lookback";
import { findCompleteCsvBlock, findPartialCsvBlock } from "./matchers";
import { CsvBlockOptions } from "./options";

export const csvBlock = (options: CsvBlockOptions): LLMOutputBlock => {
  return {
    findCompleteMatch: findCompleteCsvBlock(options),
    findPartialMatch: findPartialCsvBlock(options),
    lookBack: csvBlockLookBack(options),
    component: ({ blockMatch }) => (
      <div>
        <a href="https://llm-ui.com/docs/blocks/csv">
          Docs to setup your own component
        </a>
        <pre>{blockMatch.output}</pre>
      </div>
    ),
  };
};
