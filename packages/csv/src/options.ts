export type CsvBlockOptions = {
  startChar: string;
  endChar: string;
  delimiter: string;
  allIndexesVisible: boolean;
  visibleIndexes: number[];
};

export const defaultOptions: CsvBlockOptions = {
  startChar: "⦅",
  endChar: "⦆",
  delimiter: ",",
  allIndexesVisible: true,
  visibleIndexes: [],
};

export const getOptions = (userOptions?: Partial<CsvBlockOptions>) => {
  const result = { ...defaultOptions, ...userOptions };
  const { allIndexesVisible, visibleIndexes } = result;
  if (allIndexesVisible && visibleIndexes.length > 0) {
    throw new Error(
      "visibleIndexes should be [] when allIndexesVisible is true",
    );
  }
  return result;
};
