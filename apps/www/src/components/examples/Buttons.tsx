import { fireConfetti } from "@/animations/confetti";
import { multipleStars } from "@/animations/stars";
import { jsonBlock, parseJson5 } from "@llm-ui/json";
import type { LLMOutputBlock, LLMOutputComponent } from "@llm-ui/react";
import { z } from "zod";
import { Button } from "../ui/Button";
import { buttonsSchema } from "./buttonsSchema";

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
  ...jsonBlock("buttons", { defaultVisible: true }),
  component: buttonsComponent(onClick),
});
