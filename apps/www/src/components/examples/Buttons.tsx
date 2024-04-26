import {
  buttonsLookBack,
  findCompleteButtons,
  findPartialButtons,
  parseCompleteButtons,
} from "@llm-ui/buttons";
import type { LLMOutputBlock, LLMOutputComponent } from "@llm-ui/react/core";
import { Button } from "../ui/Button";

const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
  const buttons = parseCompleteButtons(blockMatch.output);
  if (!buttons) {
    return undefined;
  }
  return (
    <div className="flex flex-row my-4 gap-2">
      {buttons.map((button, index) => (
        <Button key={index}>{button}</Button>
      ))}
    </div>
  );
};

export const buttonsBlock: LLMOutputBlock = {
  findCompleteMatch: findCompleteButtons(),
  findPartialMatch: findPartialButtons(),
  lookBack: buttonsLookBack(),
  component: ButtonsComponent,
};
