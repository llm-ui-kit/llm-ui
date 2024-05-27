/* eslint-disable @typescript-eslint/no-explicit-any */

import { JSONPath } from "jsonpath-plus";
import { JsonAny } from "./types";

export type IsPathAllowedFunction = (
  pathPointers: string[],
  jsonObject: JsonAny,
  isLeaf: boolean,
) => boolean;

export const traverseLeafNodes = (
  jsonObject: JsonAny,
  isPathAllowed: IsPathAllowedFunction,
  callback: (node: any, path: string) => void,
): void => {
  const traverse = (currentObject: JsonAny, currentPath: string) => {
    if (currentObject !== null && typeof currentObject === "object") {
      // If it's an object or array, continue traversing
      if (
        (!Array.isArray(currentObject) &&
          Object.keys(currentObject).length === 0) ||
        (Array.isArray(currentObject) && currentObject.length === 0)
      ) {
        // Empty object or array, treat as a leaf
        if (shouldTraverse(currentPath, true)) {
          callback(currentObject, currentPath);
        }
      } else {
        if (!shouldTraverse(currentPath, false)) {
          return; // Skip this path if it's meant to be ignored
        }
        Object.entries(currentObject).forEach(([key, value]) => {
          traverse(
            value,
            `${currentPath}${Array.isArray(currentObject) ? `[${key}]` : `.${key}`}`,
          );
        });
      }
    } else {
      // Current object is a leaf (primitive or null)
      if (shouldTraverse(currentPath, true)) {
        callback(currentObject, currentPath);
      }
    }
  };

  const shouldTraverse = (path: string, isLeaf: boolean) => {
    const pathPointer: string[] = JSONPath({
      path: path,
      json: jsonObject,
      resultType: "pointer",
    });
    return isPathAllowed(pathPointer, jsonObject, isLeaf);
  };

  traverse(jsonObject, "$"); // Start from the root
};

export const isAllowed =
  (allowPaths: string[]) =>
  (pathPointers: string[], jsonObject: JsonAny, isLeaf: boolean) => {
    return (
      !isLeaf ||
      allowPaths.some((allowPath) => {
        const allowPathPointers = JSONPath({
          path: allowPath,
          json: jsonObject,
          resultType: "pointer",
        });
        return allowPathPointers.some((app: any) =>
          pathPointers.some((p) => p === app),
        );
      })
    );
  };

export const isIgnored =
  (ignorePaths: string[]) => (pathPointers: string[], jsonObject: JsonAny) => {
    return !ignorePaths.some((ignorePath) => {
      const ignorePathPointers = JSONPath({
        path: ignorePath,
        json: jsonObject,
        resultType: "pointer",
      });
      return ignorePathPointers.some((app: any) =>
        pathPointers.some((p) => p === app),
      );
    });
  };
