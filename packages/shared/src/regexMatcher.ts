import { LLMOutputMatch, MaybeLLMOutputMatch } from "@llm-ui/react";

const regexMatchToLLmOutputMatch = (
  regexMatch: RegExpMatchArray | null,
): MaybeLLMOutputMatch => {
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

export const regexMatcher =
  (regex: RegExp) =>
  (llmOutput: string): MaybeLLMOutputMatch => {
    if (regex.global) {
      throw new Error("regexMatcher does not support global regexes");
    }
    return regexMatchToLLmOutputMatch(llmOutput.match(regex));
  };

export const regexMatcherGlobal =
  (regex: RegExp) =>
  (llmOutput: string): LLMOutputMatch[] => {
    if (!regex.global) {
      throw new Error("regexMatcherGlobal does not support non-global regexes");
    }
    const matches = Array.from(llmOutput.matchAll(regex));
    if (!matches) {
      return [];
    }
    return matches
      .map((m) => regexMatchToLLmOutputMatch(m))
      .filter((m) => m !== undefined) as LLMOutputMatch[];
  };
