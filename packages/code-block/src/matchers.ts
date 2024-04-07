import { LLMOutputMatcher, MaybeLLMOutputMatch } from "llm-ui/components";
import {
  ParseFunction,
  ParseMarkdownCodeBlockOptions,
  parseCompleteMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";
import { getStartEndGroup } from "./shared";

export const regexMatcher =
  (regex: RegExp, parser: ParseFunction) =>
  (llmOutput: string): MaybeLLMOutputMatch => {
    const regexMatch = llmOutput.match(regex);
    if (regexMatch) {
      const matchString = regexMatch[0];
      const startIndex = regexMatch.index!;
      const endIndex = startIndex + matchString.length;
      return {
        startIndex,
        endIndex,
        output: matchString,
        visibleOutput: parser(matchString).code ?? matchString,
      };
    }
    return undefined;
  };

export type MarkdownMatcherOptions = {
  startEndChars: string[];
};

export const defaultOptions: MarkdownMatcherOptions = {
  startEndChars: ["`"],
};

const getOptions = (userOptions?: Partial<MarkdownMatcherOptions>) => {
  return { ...defaultOptions, ...userOptions };
};

const parseComplete = (
  userOptions: ParseMarkdownCodeBlockOptions,
): ParseFunction => {
  return (output: string) =>
    parseCompleteMarkdownCodeBlock(output, userOptions);
};

const parsePartial = (
  userOptions: ParseMarkdownCodeBlockOptions,
): ParseFunction => {
  return (output: string) => parsePartialMarkdownCodeBlock(output, userOptions);
};

export const matchCompleteMarkdownCodeBlock = (
  userOptions?: Partial<MarkdownMatcherOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const startEndGroup = getStartEndGroup(options.startEndChars);
  const regex = new RegExp(`${startEndGroup}.*\n[\\s\\S]*\n${startEndGroup}`);
  return regexMatcher(
    regex,
    parseComplete({ startEndChars: options.startEndChars }),
  );
};

export const matchPartialMarkdownCodeBlock = (
  userOptions?: Partial<MarkdownMatcherOptions>,
): LLMOutputMatcher => {
  const options = getOptions(userOptions);
  const regex = new RegExp(
    `(${options.startEndChars.map((char) => `${char}{1,2}$|${char}{3}`).join("|")})[\\s\\S]*`,
  );
  return regexMatcher(
    regex,
    parsePartial({ startEndChars: options.startEndChars }),
  );
};
