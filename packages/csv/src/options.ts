export type CsvBlockOptions = {
  startChar: string;
  endChar: string;
  delimiter: string;
};

export const defaultOptions: CsvBlockOptions = {
  startChar: "⦅",
  endChar: "⦆",
  delimiter: ",",
};

export const getOptions = (userOptions?: Partial<CsvBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
