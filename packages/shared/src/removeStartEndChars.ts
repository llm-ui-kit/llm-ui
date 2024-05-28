type StartEndChars = {
  startChar: string;
  endChar: string;
};

export const removeStartEndChars = (
  str: string,
  { startChar, endChar }: StartEndChars,
) => {
  return str.replaceAll(startChar, "").replaceAll(endChar, "");
};
