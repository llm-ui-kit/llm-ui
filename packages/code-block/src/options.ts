export type CodeBlockOptions = {
  startEndChars: string[];
};

export const defaultOptions: CodeBlockOptions = {
  startEndChars: ["`"],
};

export const getOptions = (userOptions?: Partial<CodeBlockOptions>) => {
  return { ...defaultOptions, ...userOptions };
};
