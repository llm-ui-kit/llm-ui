import { JSONPath } from "jsonpath-plus";
import { JsonAny } from "./types";

// JSON Pointer (RFC 6901) only escapes "~" and "/". The pointers come from
// jsonpath-plus and are not URI-encoded, so they must not be URI-decoded:
// decoding turned keys like "__proto%5f%5f" into "__proto__" (#301).
const decodeJsonPointerPart = (part: string): string =>
  part.replace(/~1/g, "/").replace(/~0/g, "~");

/**
 * Sets the value at a specified JSONPath within a JSON object, assuming the path is to a primitive value.
 *
 * @param object The JSON object to modify.
 * @param path The JSONPath string specifying the leaf path where the value should be set.
 * @param value The value to set at the specified path.
 */
export const setJsonPath = (
  object: JsonAny,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): void => {
  const result = JSONPath({ path: path, json: object, resultType: "pointer" });

  if (result.length === 0) {
    throw new Error("Path not found in the object.");
  }

  result.forEach((resultPath: string) => {
    let parts = resultPath.slice(1).split("/");
    let lastPart = parts.pop()!;
    let currentObject: JsonAny = object;

    // Traverse to the last object holding the target property
    parts.forEach((part) => {
      part = decodeJsonPointerPart(part);
      // Own properties only, so the traversal can never reach Object.prototype
      if (!Object.prototype.hasOwnProperty.call(currentObject, part)) {
        throw new Error("Intermediate path not found in the object.");
      }
      currentObject = currentObject[part];
    });

    lastPart = decodeJsonPointerPart(lastPart);
    currentObject[lastPart] = value;
  });
};
