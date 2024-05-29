import { LLMOutputMatcher } from "@llm-ui/react";
import { CsvBlockOptions, getOptions } from "./options";

import { regexMatcher } from "@llm-ui/shared";

export const findCompleteCsvBlock = (
  options: CsvBlockOptions,
): LLMOutputMatcher => {
  const { startChar, endChar } = getOptions(options);

  const regex = new RegExp(`${startChar}([\\s\\S]*?)${endChar}`);
  return regexMatcher(regex);
};

export const findPartialCsvBlock = (
  options: CsvBlockOptions,
): LLMOutputMatcher => {
  const { startChar } = getOptions(options);

  const regex = new RegExp(`${startChar}([\\s\\S]*)`);
  return regexMatcher(regex);
};
