import { starsAndConfetti } from "@/animations/buttonHandler";
import { csvBlock, parseCsv } from "@llm-ui/csv";
import type { LLMOutputBlock, LLMOutputComponent } from "@llm-ui/react";
import { Button } from "../ui/Button";

type OnClick = (buttonText: string | undefined) => void;

const buttonsComponent = (onClick: OnClick) => {
  const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
    const buttons = parseCsv(blockMatch.output);
    if (!buttons || !blockMatch.isVisible) {
      return undefined;
    }
    return (
      <div className="flex flex-row my-4 gap-2">
        {buttons?.map((buttonText, index) => (
          <Button key={index} onClick={() => onClick(buttonText ?? "")}>
            {buttonText}
          </Button>
        ))}
      </div>
    );
  };
  return ButtonsComponent;
};

export const buttonsCsvBlock = (
  onClick: OnClick = starsAndConfetti,
): LLMOutputBlock => ({
  ...csvBlock(),
  component: buttonsComponent(onClick),
});
