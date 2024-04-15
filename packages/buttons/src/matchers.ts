import { LLMOutputMatcher, MaybeLLMOutputMatch } from "llm-ui/components";

// todo: shared package
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

export const buttonsCompleteMatcher = (): LLMOutputMatcher => {
  const regex = /<buttons>[\s\S]*<\/buttons>/;
  return regexMatcher(regex);
};

export const buttonsPartialMatcher = (): LLMOutputMatcher => {
  const regex = /<?b?u?t?t?o?n?s?>?[\s\S]*<?\/?b?u?t?t?o?n?s?>?/;
  return regexMatcher(regex);
};
