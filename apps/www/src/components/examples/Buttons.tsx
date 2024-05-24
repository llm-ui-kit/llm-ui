import { fireConfetti } from "@/animations/confetti";
import { multipleStars } from "@/animations/stars";
import { customBlock, parseJson5 } from "@llm-ui/custom";
import type { LLMOutputBlock, LLMOutputComponent } from "@llm-ui/react";
import { Button } from "../ui/Button";
import { buttonsSchema } from "./buttonsSchema";

type OnClick = (buttonText: string | undefined) => void;

const buttonsPartialSchema = buttonsSchema.deepPartial();

const buttonsComponent = (onClick: OnClick) => {
  const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
    const buttons = buttonsPartialSchema.parse(parseJson5(blockMatch.output));
    if (!buttons) {
      return undefined;
    }
    return (
      <div className="flex flex-row my-4 gap-2">
        {buttons?.btns?.map((button, index) => (
          <Button key={index} onClick={() => onClick(button?.text)}>
            {button?.text}
          </Button>
        ))}
      </div>
    );
  };
  return ButtonsComponent;
};

export const starsAndConfetti = (buttonText: string = "") => {
  if (buttonText.toLowerCase().includes("star")) {
    multipleStars();
  } else if (buttonText.toLowerCase().includes("confetti")) {
    fireConfetti();
  }
};

export const buttonsBlock = (
  onClick: OnClick = starsAndConfetti,
): LLMOutputBlock => ({
  ...customBlock("btn"),
  component: buttonsComponent(onClick),
});
