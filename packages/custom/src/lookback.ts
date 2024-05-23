import { LookBackFunction } from "@llm-ui/react";
import { pick, values } from "remeda";
import { CustomBlockOptions, getOptions } from "./options";
import { parseJson5 } from "./parseJson5";
import { removeStartEndChars } from "./shared";

export const customBlockLookBack = (
  type: string,
  userOptions?: Partial<CustomBlockOptions>,
): LookBackFunction => {
  const options = getOptions(userOptions);
  const { excludeVisibleKeys } = options;
  return ({ output, visibleTextLengthTarget }) => {
    const object = parseJson5(removeStartEndChars(output, options));
    if (!object || object.t !== type) {
      return { output: "", visibleText: "" };
    }
    const keys = Object.keys(object);
    const invisibleKeys = ["t", ...excludeVisibleKeys];
    const visibleKeys = keys.filter((key) => !invisibleKeys.includes(key));

    const result = pick(object, invisibleKeys);
    let remainingChars = visibleTextLengthTarget;
    let visibleKeyIndex = 0;
    while (remainingChars > 0 && visibleKeyIndex < visibleKeys.length) {
      const key = visibleKeys[visibleKeyIndex];
      const value = object[key];
      if (typeof value === "string") {
        const chars = Math.min(remainingChars, value.length);
        result[key] = value.slice(0, chars);
        remainingChars -= chars;
      }
      visibleKeyIndex++;
    }
    const visibleText = values(pick(result, visibleKeys)).join(" ");
    return {
      output: JSON.stringify(result, null, 2),
      visibleText,
    };
  };
};
