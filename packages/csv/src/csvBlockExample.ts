import { CsvBlockOptions, getOptions } from "./options";

export const csvBlockExample = (
  example: string[],
  options: CsvBlockOptions,
): string => {
  const { startChar, endChar, delimiter, type } = getOptions(options);
  return `${startChar}${[type, ...example].join(delimiter)}${endChar}`;
};
