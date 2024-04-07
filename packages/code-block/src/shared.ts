export const getStartEndGroup = (startEndChars: string[]) => {
  const triples = startEndChars.map((char) => char.repeat(3));
  return `(${triples.join("|")})`;
};
