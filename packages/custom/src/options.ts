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
  typeKey: "t",
};

export const getOptions = (userOptions?: Partial<CustomBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
