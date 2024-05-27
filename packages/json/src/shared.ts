import { JsonBlockOptions } from "./options";

export const removeStartEndChars = (
  str: string,
  { startChar, endChar }: JsonBlockOptions,
) => {
  return str.replaceAll(startChar, "").replaceAll(endChar, "");
};
