import { LLMOutputMatcher, MaybeMatch } from "llm-ui/components";
import { getStartEndGroup } from "./shared";

export const regexMatcher =
  (regex: RegExp) =>
  (llmOutput: string): MaybeMatch => {
    const regexMatch = llmOutput.match(regex);
    if (regexMatch) {
      const matchString = regexMatch[0];
      const startIndex = regexMatch.index!;
      const endIndex = startIndex + matchString.length;
      return { startIndex, endIndex, match: matchString };
    }
    return undefined;
  };

export type MarkdownMatcherOptions = {
  startEndChars: string[];
};

export const defaultOptions: MarkdownMatcherOptions = {
  startEndChars: ["```"],
};

const getOptions = (userOptions?: Partial<MarkdownMatcherOptions>) => {
  return { ...defaultOptions, ...userOptions };
};

export const matchFullMarkdownCodeBlock = (
  userOptions?: Partial<MarkdownMatcherOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const startEndGroup = getStartEndGroup(options.startEndChars);
  const regex = new RegExp(`${startEndGroup}\n[\\s\\S]*\n${startEndGroup}`);
  return regexMatcher(regex);
};

export const matchPartialMarkdownCodeBlock = (
  userOptions?: Partial<MarkdownMatcherOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const startEndGroup = getStartEndGroup(options.startEndChars);
  const regex = new RegExp(`${startEndGroup}\n[\\s\\S]*`);
  return regexMatcher(regex);
};
