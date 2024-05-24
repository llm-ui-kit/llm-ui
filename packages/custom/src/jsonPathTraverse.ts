/* eslint-disable @typescript-eslint/no-explicit-any */

import { JSONPath } from "jsonpath-plus";
import { JsonAny } from "./types";

/**
 * Traverses a JSON object or array, applying a callback function to each leaf node that is not ignored.
 *
 * @param jsonObject The JSON object or array to traverse.
 * @param ignorePaths An array of JSONPath strings specifying the paths to ignore.
 * @param callback A function to call for each non-ignored leaf node. Receives the node and its path.
 */
export const traverseLeafNodesWithIgnores = (
  jsonObject: JsonAny,
  ignorePaths: string[],
  callback: (node: any, path: string) => void,
): void => {
  const traverse = (currentObject: JsonAny, currentPath: string) => {
    if (isIgnored(currentPath)) {
      return; // Skip this path if it's meant to be ignored
    }
    if (currentObject !== null && typeof currentObject === "object") {
      // If it's an object or array, continue traversing
      if (
        (!Array.isArray(currentObject) &&
          Object.keys(currentObject).length === 0) ||
        (Array.isArray(currentObject) && currentObject.length === 0)
      ) {
        // Empty object or array, treat as a leaf
        if (!isIgnored(currentPath)) {
          callback(currentObject, currentPath);
        }
      } else {
        Object.entries(currentObject).forEach(([key, value]) => {
          traverse(
            value,
            `${currentPath}${Array.isArray(currentObject) ? `[${key}]` : `.${key}`}`,
          );
        });
      }
    } else {
      // Current object is a leaf (primitive or null)
      if (!isIgnored(currentPath)) {
        callback(currentObject, currentPath);
      }
    }
  };

  const isIgnored = (path: string) => {
    const pathPointer: string[] = JSONPath({
      path: path,
      json: jsonObject,
      resultType: "pointer",
    });
    return ignorePaths.some((ignorePath) => {
      const ignoredNodes = JSONPath({
        path: ignorePath,
        json: jsonObject,
        resultType: "pointer",
      });
      return ignoredNodes.some((pointer: any) =>
        pathPointer.some((p) => p === pointer),
      );
    });
  };

  traverse(jsonObject, "$"); // Start from the root
};
