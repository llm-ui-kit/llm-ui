import { CsvBlockOptions, getOptions } from "./options";

export const csvBlockExample = (
  example: string[],
  userOptions?: Partial<CsvBlockOptions>,
): string => {
  const { startChar, endChar, delimiter } = getOptions(userOptions);
  return `${startChar}${example.join(delimiter)}${endChar}`;
};
