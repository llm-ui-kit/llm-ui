import { regexMatcher } from "@llm-ui/shared";
import { LLMOutputMatcher } from "llm-ui/components";

export const buttonsCompleteMatcher = (): LLMOutputMatcher => {
  const regex = /<buttons>[\s\S]*<\/buttons>/;
  return regexMatcher(regex);
};

export const buttonsPartialMatcher = (): LLMOutputMatcher => {
  const regex = /<?b?u?t?t?o?n?s?>?[\s\S]*<?\/?b?u?t?t?o?n?s?>?/;
  return regexMatcher(regex);
};
