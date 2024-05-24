import { LLMOutputMatcher } from "@llm-ui/react";
import { regexMatcher } from "@llm-ui/shared";
import { CustomBlockOptions, getOptions } from "./options";
import { parseJson5 } from "./parseJson5";
import { removeStartEndChars } from "./shared";

const findCustomBlock = (
  type: string,
  regex: RegExp,
  options: CustomBlockOptions,
): LLMOutputMatcher => {
  const matcher = regexMatcher(regex);
  return (llmOutput: string) => {
    const match = matcher(llmOutput);
    if (match) {
      const block = parseJson5(removeStartEndChars(match.outputRaw, options));
      if (!block || block[options.typeKey] !== type) {
        return undefined;
      }
    }
    return match;
  };
};

export const findCompleteCustomBlock = (
  type: string,
  userOptions?: Partial<CustomBlockOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const { startChar, endChar } = options;
  const regex = new RegExp(`${startChar}([\\s\\S]*?)${endChar}`);
  return findCustomBlock(type, regex, options);
};

export const findPartialCustomBlock = (
  type: string,
  userOptions?: Partial<CustomBlockOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const { startChar } = options;
  const regex = new RegExp(`${startChar}([\\s\\S]*)`);
  return findCustomBlock(type, regex, options);
};
