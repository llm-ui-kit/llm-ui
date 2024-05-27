import { jsonrepair } from "jsonrepair";

export const parseJson5 = (json5: string) => {
  try {
    return JSON.parse(jsonrepair(json5));
  } catch (e) {
    return undefined;
  }
};
