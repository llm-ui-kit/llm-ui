import {
  buttonsLookBack,
  findCompleteButtons,
  findPartialButtons,
  parseCompleteButtons,
} from "@llm-ui/buttons";
import type { LLMOutputBlock, LLMOutputComponent } from "@llm-ui/react/core";
import { Button } from "../ui/Button";

type OnClick = (buttonText: string) => void;

const buttonsComponent = (onClick: OnClick) => {
  const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
    const buttons = parseCompleteButtons(blockMatch.output);
    if (!buttons) {
      return undefined;
    }
    return (
      <div className="flex flex-row my-4 gap-2">
        {buttons.map((button, index) => (
          <Button key={index} onClick={() => onClick(button)}>
            {button}
          </Button>
        ))}
      </div>
    );
  };
  return ButtonsComponent;
};

export const buttonsBlock = (onClick: OnClick): LLMOutputBlock => ({
  findCompleteMatch: findCompleteButtons(),
  findPartialMatch: findPartialButtons(),
  lookBack: buttonsLookBack(),
  component: buttonsComponent(onClick),
});
