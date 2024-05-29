export type CsvBlockOptionsComplete = {
  type: string;
  startChar: string;
  endChar: string;
  delimiter: string;
  allIndexesVisible: boolean;
  visibleIndexes: number[];
};

export const defaultOptions: Omit<CsvBlockOptionsComplete, "type"> = {
  startChar: "⦅",
  endChar: "⦆",
  delimiter: ",",
  allIndexesVisible: true,
  visibleIndexes: [],
};

export type CsvBlockOptions = Partial<Omit<CsvBlockOptionsComplete, "type">> &
  Pick<CsvBlockOptionsComplete, "type">;

export const getOptions = (
  userOptions: CsvBlockOptions,
): CsvBlockOptionsComplete => {
  const result = { ...defaultOptions, ...userOptions };
  const { type, allIndexesVisible, visibleIndexes } = result;
  if (!type) {
    throw new Error("type option is required");
  }
  if (allIndexesVisible && visibleIndexes.length > 0) {
    throw new Error(
      "visibleIndexes should be [] when allIndexesVisible is true",
    );
  }
  return result;
};
