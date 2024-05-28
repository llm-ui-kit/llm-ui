import { CsvBlockOptions, getOptions } from "./options";

export const parseCsv = (
  csv: string,
  options?: Partial<CsvBlockOptions>,
): string[] => {
  const { delimiter } = getOptions(options);
  return csv.split(delimiter).filter((item) => item !== "");
};
