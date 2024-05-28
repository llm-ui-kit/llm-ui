import { LLMOutputMatcher } from "@llm-ui/react";
import { CsvBlockOptions, getOptions } from "./options";

import { regexMatcher } from "@llm-ui/shared";

export const findCompleteCsvBlock = (
  userOptions?: Partial<CsvBlockOptions>,
): LLMOutputMatcher => {
  const { startChar, endChar } = getOptions(userOptions);

  const regex = new RegExp(`${startChar}([\\s\\S]*?)${endChar}`);
  return regexMatcher(regex);
};

export const findPartialCsvBlock = (
  userOptions?: Partial<CsvBlockOptions>,
): LLMOutputMatcher => {
  const { startChar } = getOptions(userOptions);

  const regex = new RegExp(`${startChar}([\\s\\S]*)`);
  return regexMatcher(regex);
};
