export type CustomBlockOptions = {
  startChar: string;
  endChar: string;
  defaultVisible: boolean;
  visibleKeyPaths: string[];
  invisibleKeyPaths: string[];
  typeKey: string;
};

export const defaultOptions: CustomBlockOptions = {
  startChar: "【",
  endChar: "】",
  defaultVisible: false,
  visibleKeyPaths: [],
  invisibleKeyPaths: [],
  typeKey: "type",
};

export const getOptions = (userOptions?: Partial<CustomBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
