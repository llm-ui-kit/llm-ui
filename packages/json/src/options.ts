export type JsonBlockOptions = {
  startChar: string;
  endChar: string;
  defaultVisible: boolean;
  visibleKeyPaths: string[];
  invisibleKeyPaths: string[];
  typeKey: string;
};

export const defaultOptions: JsonBlockOptions = {
  startChar: "【",
  endChar: "】",
  defaultVisible: false,
  visibleKeyPaths: [],
  invisibleKeyPaths: [],
  typeKey: "type",
};

export const getOptions = (userOptions?: Partial<JsonBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
