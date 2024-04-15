import {
  buttonsBlock as buttonsBlockOriginal,
  parseCompleteButtons,
} from "@llm-ui/buttons";
import type { LLMOutputBlock, LLMOutputComponent } from "llm-ui/components";
import { Button } from "../ui/Button";

const ButtonsComponent: LLMOutputComponent = ({ llmOutput }) => {
  const buttons = parseCompleteButtons(llmOutput);
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
  ...buttonsBlockOriginal,
  component: ButtonsComponent,
};
