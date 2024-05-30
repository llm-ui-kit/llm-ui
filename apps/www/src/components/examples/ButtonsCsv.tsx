import { starsAndConfetti } from "@/animations/buttonHandler";
import { csvBlock, parseCsv } from "@llm-ui/csv";
import type { LLMOutputBlock, LLMOutputComponent } from "@llm-ui/react";
import { Button } from "../ui/Button";

type OnClick = (buttonText: string | undefined) => void;

const options = {
  type: "buttons",
  delimiter: ";",
};

const buttonsComponent = (onClick: OnClick) => {
  const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_type, ...buttons] = parseCsv(blockMatch.output, options);
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
  ...csvBlock(options),
  component: buttonsComponent(onClick),
});
