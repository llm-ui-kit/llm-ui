export type JsonBlockOptionsComplete = {
  type: string;
  startChar: string;
  endChar: string;
  defaultVisible: boolean;
  visibleKeyPaths: string[];
  invisibleKeyPaths: string[];
  typeKey: string;
};

export const defaultOptions: Omit<JsonBlockOptionsComplete, "type"> = {
  startChar: "【",
  endChar: "】",
  defaultVisible: false,
  visibleKeyPaths: [],
  invisibleKeyPaths: [],
  typeKey: "type",
};

export type JsonBlockOptions = Partial<Omit<JsonBlockOptionsComplete, "type">> &
  Pick<JsonBlockOptionsComplete, "type">;

export const getOptions = (
  userOptions: JsonBlockOptions,
): JsonBlockOptionsComplete => {
  if (!userOptions.type) {
    throw new Error("type option is required");
  }
  return { ...defaultOptions, ...userOptions };
};
