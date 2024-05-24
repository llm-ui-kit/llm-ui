export type CustomBlockOptions = {
  startChar: string;
  endChar: string;
  invisibleKeyPaths: string[];
  typeKey: string;
};

export const defaultOptions: CustomBlockOptions = {
  startChar: "【",
  endChar: "】",
  invisibleKeyPaths: [],
  typeKey: "type",
};

export const getOptions = (userOptions?: Partial<CustomBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
