import { MaybeLLMOutputMatch } from "llm-ui/core";

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
