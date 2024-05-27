import { LLMOutputMatcher } from "@llm-ui/react";
import { regexMatcher } from "@llm-ui/shared";
import { JsonBlockOptions, getOptions } from "./options";
import { parseJson5 } from "./parseJson5";
import { removeStartEndChars } from "./shared";

const findJsonBlock = (
  type: string,
  regex: RegExp,
  options: JsonBlockOptions,
): LLMOutputMatcher => {
  const matcher = regexMatcher(regex);
  return (llmOutput: string) => {
    const match = matcher(llmOutput);
    if (!match) {
      return undefined;
    }
    const block = parseJson5(removeStartEndChars(match.outputRaw, options));

    if (!block || block[options.typeKey] !== type) {
      return undefined;
    }
    return match;
  };
};

export const findCompleteJsonBlock = (
  type: string,
  userOptions?: Partial<JsonBlockOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const { startChar, endChar } = options;
  const regex = new RegExp(`${startChar}([\\s\\S]*?)${endChar}`);
  return findJsonBlock(type, regex, options);
};

export const findPartialJsonBlock = (
  type: string,
  userOptions?: Partial<JsonBlockOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const { startChar } = options;
  const regex = new RegExp(`${startChar}([\\s\\S]*)`);
  return findJsonBlock(type, regex, options);
};
