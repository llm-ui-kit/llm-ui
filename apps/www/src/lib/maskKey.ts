export const getMaskedKey = (value: string): string => {
  const charsToShow = 3;
  const maskedLength = Math.max(0, value.length - charsToShow);
  return `${value.substring(0, charsToShow)}${"*".repeat(maskedLength)}`;
};
