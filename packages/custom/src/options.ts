export type CustomBlockOptions = {
  startChar: string;
  endChar: string;
  excludeVisibleKeys: string[];
};

export const defaultOptions: CustomBlockOptions = {
  startChar: "【",
  endChar: "】",
  excludeVisibleKeys: [],
};

export const getOptions = (userOptions?: Partial<CustomBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
