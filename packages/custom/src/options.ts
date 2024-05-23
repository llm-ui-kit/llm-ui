export type CustomBlockOptions = {
  startChar: string;
  endChar: string;
  invisibleKeyPaths: string[];
};

export const defaultOptions: CustomBlockOptions = {
  startChar: "【",
  endChar: "】",
  invisibleKeyPaths: [],
};

export const getOptions = (userOptions?: Partial<CustomBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
