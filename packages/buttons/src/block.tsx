import { LLMOutputBlock, LLMOutputComponent } from "llm-ui/core";
import { buttonsLookBack } from "./lookBack";
import { buttonsCompleteMatcher, buttonsPartialMatcher } from "./matchers";
import { parseCompleteButtons } from "./parse";

const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  const buttons = parseCompleteButtons(blockMatch.output);
  if (!buttons) {
    return undefined;
  }
  return (
    <div>
      {buttons.map((button, index) => (
        <button key={index}>{button}</button>
      ))}
    </div>
  );
};

export const buttonsBlock: LLMOutputBlock = {
  component: ButtonsComponent,
  lookBack: buttonsLookBack(),
  findPartialMatch: buttonsPartialMatcher(),
  findCompleteMatch: buttonsCompleteMatcher(),
};
