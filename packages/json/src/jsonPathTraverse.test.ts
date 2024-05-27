import { describe, expect, it } from "vitest";
import {
  IsPathAllowedFunction,
  isAllowed,
  isIgnored,
  traverseLeafNodes,
} from "./jsonPathTraverse";

type TestCase = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonObject: any;
  isPathAllowed: IsPathAllowedFunction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expected: { node: any; path: string }[];
};

describe("traverseLeafNodes", () => {
  const testCases: TestCase[] = [
    // allowed
    {
      name: "{ a: 1 }",
      jsonObject: { a: 1 },
      isPathAllowed: isAllowed(["$.a"]),
      expected: [{ node: 1, path: "$.a" }],
    },
    {
      name: "{ a: 1, b: 2 }",
      jsonObject: { a: 1, b: 2 },
      isPathAllowed: isAllowed(["$.a", "$.b"]),
      expected: [
        { node: 1, path: "$.a" },
        { node: 2, path: "$.b" },
      ],
    },
    {
      name: "nested objects",
      jsonObject: { a: { b: 2 } },
      isPathAllowed: isAllowed(["$.a.b"]),
      expected: [{ node: 2, path: "$.a.b" }],
    },
    {
      name: "array",
      jsonObject: { a: [{ b: 2 }] },
      isPathAllowed: isAllowed(["$.a[*].b"]),
      expected: [{ node: 2, path: "$.a[0].b" }],
    },
    {
      name: "allow root key",
      jsonObject: { a: 1, b: 2 },
      isPathAllowed: isAllowed(["$.b"]),
      expected: [{ node: 2, path: "$.b" }],
    },
    {
      name: "allow nested key",
      jsonObject: { a: { b: 2, c: 3 } },
      isPathAllowed: isAllowed(["$.a.c"]),
      expected: [{ node: 3, path: "$.a.c" }],
    },
    {
      name: "allow nested key in array",
      jsonObject: {
        a: [
          { b: 1, c: 2 },
          { b: 3, c: 4 },
        ],
      },
      isPathAllowed: isAllowed(["$.a[*].c"]),
      expected: [
        { node: 2, path: "$.a[0].c" },
        {
          node: 4,
          path: "$.a[1].c",
        },
      ],
    },

    // ignores

    {
      name: "{ a: 1 }",
      jsonObject: { a: 1 },
      isPathAllowed: isIgnored([]),
      expected: [{ node: 1, path: "$.a" }],
    },
    {
      name: "{ a: 1, b: 2 }",
      jsonObject: { a: 1, b: 2 },
      isPathAllowed: isIgnored([]),
      expected: [
        { node: 1, path: "$.a" },
        { node: 2, path: "$.b" },
      ],
    },
    {
      name: "nested objects",
      jsonObject: { a: { b: 2 } },
      isPathAllowed: isIgnored([]),
      expected: [{ node: 2, path: "$.a.b" }],
    },
    {
      name: "array",
      jsonObject: { a: [{ b: 2 }] },
      isPathAllowed: isIgnored([]),
      expected: [{ node: 2, path: "$.a[0].b" }],
    },
    {
      name: "ignore root key",
      jsonObject: { a: 1, b: 2 },
      isPathAllowed: isIgnored(["$.a"]),
      expected: [{ node: 2, path: "$.b" }],
    },
    {
      name: "ignore root key of nested object",
      jsonObject: { a: { b: 2 } },
      isPathAllowed: isIgnored(["$.a"]),
      expected: [],
    },
    {
      name: "ignore nested key",
      jsonObject: { a: { b: 2, c: 3 } },
      isPathAllowed: isIgnored(["$.a.b"]),
      expected: [{ node: 3, path: "$.a.c" }],
    },
    {
      name: "ignore nested key in array",
      jsonObject: {
        a: [
          { b: 1, c: 2 },
          { b: 3, c: 4 },
        ],
      },
      isPathAllowed: isIgnored(["$.a[*].b"]),
      expected: [
        { node: 2, path: "$.a[0].c" },
        {
          node: 4,
          path: "$.a[1].c",
        },
      ],
    },
  ];

  testCases.forEach(({ name, jsonObject, isPathAllowed, expected }) => {
    it(name, () => {
      const result: TestCase["expected"] = [];
      traverseLeafNodes(jsonObject, isPathAllowed, (node, path) => {
        result.push({ node, path });
      });
      expect(result).toEqual(expected);
    });
  });
});
