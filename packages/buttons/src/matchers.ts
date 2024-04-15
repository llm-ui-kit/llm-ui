import { regexMatcher } from "@llm-ui/shared";
import { LLMOutputMatcher } from "llm-ui/components";

export const buttonsCompleteMatcher = (): LLMOutputMatcher => {
  const regex = /<buttons>[\s\S]*<\/buttons>/;
  return regexMatcher(regex);
};

export const buttonsPartialMatcher = (): LLMOutputMatcher => {
  const regex =
    /(<b$|<bu$|<but$|<butt$|<butto$|<button$|<buttons$|<buttons>$|<buttons>[\s\S]*)/;
  return regexMatcher(regex);
};
