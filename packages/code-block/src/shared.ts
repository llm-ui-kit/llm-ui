export const getStartEndGroup = (startEndChars: string[]) =>
  `(${startEndChars.join("|")})`;
