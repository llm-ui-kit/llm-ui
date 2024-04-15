import { LLMOutputBlock, LLMOutputComponent } from "llm-ui/components";
import { buttonsLookBack } from "./lookBack";
import { buttonsCompleteMatcher, buttonsPartialMatcher } from "./matchers";
import { parseCompleteButtons } from "./parse";

const ButtonsComponent: LLMOutputComponent = ({ llmOutput }) => {
  const buttons = parseCompleteButtons(llmOutput);
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
  isPartialMatch: buttonsPartialMatcher(),
  isCompleteMatch: buttonsCompleteMatcher(),
};
