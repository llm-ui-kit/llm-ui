import { LLMOutputMatcher } from "@llm-ui/react";
import { regexMatcherGlobal, removeStartEndChars } from "@llm-ui/shared";
import {
  JsonBlockOptions,
  JsonBlockOptionsComplete,
  getOptions,
} from "./options";
import { parseJson5 } from "./parseJson5";

const findJsonBlock = (
  regex: RegExp,
  options: JsonBlockOptionsComplete,
): LLMOutputMatcher => {
  const { type } = options;
  const matcher = regexMatcherGlobal(regex);
  return (llmOutput: string) => {
    const matches = matcher(llmOutput);
    if (matches.length === 0) {
      return undefined;
    }
    return matches.find((match) => {
      const block = parseJson5(removeStartEndChars(match.outputRaw, options));

      if (!block || block[options.typeKey] !== type) {
        return undefined;
      }
      return match;
    });
  };
};

export const findCompleteJsonBlock = (
  userOptions: JsonBlockOptions,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const { startChar, endChar } = options;
  const regex = new RegExp(`${startChar}([\\s\\S]*?)${endChar}`, "g");
  return findJsonBlock(regex, options);
};

export const findPartialJsonBlock = (
  userOptions: JsonBlockOptions,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const { startChar } = options;
  const regex = new RegExp(`${startChar}([\\s\\S]*)`, "g");
  return findJsonBlock(regex, options);
};
