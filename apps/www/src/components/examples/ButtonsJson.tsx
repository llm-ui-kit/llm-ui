import { starsAndConfetti } from "@/animations/buttonHandler";
import { jsonBlock, parseJson5 } from "@llm-ui/json";
import type { LLMOutputBlock, LLMOutputComponent } from "@llm-ui/react";
import z from "zod";
import { Button } from "../ui/Button";

type OnClick = (buttonText: string | undefined) => void;

const partialSchema = z.object({
  type: z.literal("buttons"),
  buttons: z
    .array(z.object({ text: z.string().nullable().optional() }))
    .nullable()
    .optional(),
});

const buttonsComponent = (onClick: OnClick) => {
  const ButtonsComponent: LLMOutputComponent = ({ blockMatch }) => {
    const buttons = partialSchema.parse(parseJson5(blockMatch.output));
    if (!buttons || !blockMatch.isVisible) {
      return undefined;
    }
    return (
      <div className="flex flex-row my-4 gap-2">
        {buttons?.buttons?.map((button, index) => (
          <Button key={index} onClick={() => onClick(button?.text ?? "")}>
            {button?.text}
          </Button>
        ))}
      </div>
    );
  };
  return ButtonsComponent;
};

export const buttonsJsonBlock = (
  onClick: OnClick = starsAndConfetti,
): LLMOutputBlock => ({
  ...jsonBlock({ type: "buttons", defaultVisible: true }),
  component: buttonsComponent(onClick),
});
