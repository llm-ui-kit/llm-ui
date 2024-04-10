import { LLMOutputMatcher, MaybeLLMOutputMatch } from "llm-ui/components";
import { CodeBlockOptions, getOptions } from "./options";

import { getStartEndGroup } from "./shared";

export const regexMatcher =
  (regex: RegExp) =>
  (llmOutput: string): MaybeLLMOutputMatch => {
    const regexMatch = llmOutput.match(regex);
    if (regexMatch) {
      const matchString = regexMatch[0];
      const startIndex = regexMatch.index!;
      const endIndex = startIndex + matchString.length;
      return {
        startIndex,
        endIndex,
        outputRaw: matchString,
      };
    }
    return undefined;
  };

export const codeBlockCompleteMatcher = (
  userOptions?: Partial<CodeBlockOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const startEndGroup = getStartEndGroup(options.startEndChars);
  const regex = new RegExp(
    `${startEndGroup}.*\n([\\s\\S]*?)\n${startEndGroup}`,
  );
  return regexMatcher(regex);
};

export const codeBlockPartialMatcher = (
  userOptions?: Partial<CodeBlockOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const regex = new RegExp(
    `(${options.startEndChars.map((char) => `${char}{1,2}$|${char}{3}`).join("|")})[\\s\\S]*`,
  );
  return regexMatcher(regex);
};
