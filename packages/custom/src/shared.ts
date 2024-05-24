import { CustomBlockOptions } from "./options";

export const removeStartEndChars = (
  str: string,
  { startChar, endChar }: CustomBlockOptions,
) => {
  return str.replaceAll(startChar, "").replaceAll(endChar, "");
};
