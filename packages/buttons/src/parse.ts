import { XMLParser, XMLValidator } from "fast-xml-parser";
const parser = new XMLParser();

export type Button = string;
export type Buttons = Button[] | undefined;

export const parseCompleteButtons = (buttonsString: string): Buttons => {
  const validationResult = XMLValidator.validate(buttonsString);
  if (validationResult !== true) {
    return undefined;
  }
  const parsed = parser.parse(buttonsString);
  if (!parsed.buttons || !parsed.buttons.button) {
    return undefined;
  }
  if (
    Array.isArray(parsed.buttons.button) &&
    parsed.buttons.button.length >= 0
  ) {
    return parsed.buttons.button;
  }
  if (typeof parsed.buttons.button === "string") {
    return [parsed.buttons.button];
  }
  return undefined;
};
