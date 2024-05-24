import { LookBackFunction } from "@llm-ui/react";
import { setJsonPath } from "./jsonPathSet";
import { traverseLeafNodesWithIgnores } from "./jsonPathTraverse";
import { CustomBlockOptions, getOptions } from "./options";
import { parseJson5 } from "./parseJson5";
import { removeStartEndChars } from "./shared";

export const customBlockLookBack = (
  type: string,
  userOptions?: Partial<CustomBlockOptions>,
): LookBackFunction => {
  const options = getOptions(userOptions);
  const { invisibleKeyPaths, typeKey } = options;
  return ({ output, visibleTextLengthTarget }) => {
    const object = parseJson5(removeStartEndChars(output, options));
    if (!object || object[typeKey] !== type) {
      return { output: "", visibleText: "" };
    }
    const invisiblePaths = [`$.${typeKey}`, ...invisibleKeyPaths];
    let remainingChars = visibleTextLengthTarget;

    let visibleText = "";
    traverseLeafNodesWithIgnores(object, invisiblePaths, (value, path) => {
      const valueString = `${value}`;
      const chars = Math.min(remainingChars, valueString.length);
      const valueVisible = valueString.slice(0, chars);
      visibleText += valueVisible;
      setJsonPath(object, path, valueVisible);
      remainingChars -= chars;
    });

    return {
      output: JSON.stringify(object, null, 2),
      visibleText,
    };
  };
};
