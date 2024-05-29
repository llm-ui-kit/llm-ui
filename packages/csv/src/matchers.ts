import { LLMOutputMatcher } from "@llm-ui/react";
import { CsvBlockOptions, getOptions } from "./options";

import { regexMatcher } from "@llm-ui/shared";

export const findCompleteCsvBlock = (
  options: CsvBlockOptions,
): LLMOutputMatcher => {
  const { type, startChar, endChar, delimiter } = getOptions(options);

  const regex = new RegExp(
    `${startChar}${type}${delimiter}([\\s\\S]*?)${endChar}`,
  );
  return regexMatcher(regex);
};

export const findPartialCsvBlock = (
  options: CsvBlockOptions,
): LLMOutputMatcher => {
  const { type, startChar, delimiter } = getOptions(options);

  const regex = new RegExp(`${startChar}${type}${delimiter}([\\s\\S]*)`);
  return regexMatcher(regex);
};
