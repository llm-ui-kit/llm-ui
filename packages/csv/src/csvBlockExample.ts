import { CsvBlockOptions, getOptions } from "./options";

export const csvBlockExample = (
  example: string[],
  options: CsvBlockOptions,
): string => {
  const { startChar, endChar, delimiter } = getOptions(options);
  return `${startChar}${example.join(delimiter)}${endChar}`;
};
