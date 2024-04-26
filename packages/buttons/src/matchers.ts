import { LLMOutputMatcher } from "@llm-ui/react/core";
import { regexMatcher } from "@llm-ui/shared";

export const findCompleteButtons = (): LLMOutputMatcher => {
  const regex = /<buttons>[\s\S]*<\/buttons>/;
  return regexMatcher(regex);
};

export const findPartialButtons = (): LLMOutputMatcher => {
  const regex =
    /(<b$|<bu$|<but$|<butt$|<butto$|<button$|<buttons$|<buttons>$|<buttons>[\s\S]*)/;
  return regexMatcher(regex);
};
