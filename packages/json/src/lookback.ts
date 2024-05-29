import { LookBackFunction } from "@llm-ui/react";
import { removeStartEndChars } from "@llm-ui/shared";
import { setJsonPath } from "./jsonPathSet";
import { isAllowed, isIgnored, traverseLeafNodes } from "./jsonPathTraverse";
import { JsonBlockOptions, getOptions } from "./options";
import { parseJson5 } from "./parseJson5";

export const jsonBlockLookBack = (
  userOptions: JsonBlockOptions,
): LookBackFunction => {
  const options = getOptions(userOptions);
  const { type, typeKey, defaultVisible, visibleKeyPaths, invisibleKeyPaths } =
    options;
  return ({ output, visibleTextLengthTarget, isComplete }) => {
    const object = parseJson5(removeStartEndChars(output, options));
    if (!object || object[typeKey] !== type) {
      return { output: "", visibleText: "" };
    }
    let remainingChars = visibleTextLengthTarget;

    let visibleText = "";
    const shouldTraverse = defaultVisible
      ? isIgnored([`$.${typeKey}`, ...invisibleKeyPaths])
      : isAllowed(visibleKeyPaths);

    traverseLeafNodes(object, shouldTraverse, (value, path) => {
      if (typeof value === "string") {
        const valueString = `${value}`;
        const chars = Math.min(remainingChars, valueString.length);
        const valueVisible = valueString.slice(0, chars);
        visibleText += valueVisible;
        setJsonPath(object, path, valueVisible);
        remainingChars -= chars;
      }
    });

    const isStreamingKeys = defaultVisible || visibleKeyPaths.length > 0;

    return {
      output: JSON.stringify(object, null, 2),
      visibleText: isStreamingKeys
        ? visibleText
        : isComplete && visibleTextLengthTarget > 0
          ? " " // Show a space if the block is complete and there is no visible text
          : "",
    };
  };
};
