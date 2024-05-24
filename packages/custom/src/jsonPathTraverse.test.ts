import { describe, expect, it } from "vitest";
import { traverseLeafNodesWithIgnores } from "./jsonPathTraverse";

type TestCase = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonObject: any;
  ignorePaths: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expected: { node: any; path: string }[];
};

describe("traverseLeafNodesWithIgnores", () => {
  const testCases: TestCase[] = [
    {
      name: "{ a: 1 }",
      jsonObject: { a: 1 },
      ignorePaths: [],
      expected: [{ node: 1, path: "$.a" }],
    },
    {
      name: "{ a: 1, b: 2 }",
      jsonObject: { a: 1, b: 2 },
      ignorePaths: [],
      expected: [
        { node: 1, path: "$.a" },
        { node: 2, path: "$.b" },
      ],
    },
    {
      name: "nested objects",
      jsonObject: { a: { b: 2 } },
      ignorePaths: [],
      expected: [{ node: 2, path: "$.a.b" }],
    },
    {
      name: "array",
      jsonObject: { a: [{ b: 2 }] },
      ignorePaths: [],
      expected: [{ node: 2, path: "$.a[0].b" }],
    },
    {
      name: "ignore root key",
      jsonObject: { a: 1, b: 2 },
      ignorePaths: ["$.a"],
      expected: [{ node: 2, path: "$.b" }],
    },
    {
      name: "ignore root key of nested object",
      jsonObject: { a: { b: 2 } },
      ignorePaths: ["$.a"],
      expected: [],
    },
    {
      name: "ignore nested key",
      jsonObject: { a: { b: 2, c: 3 } },
      ignorePaths: ["$.a.b"],
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
      ignorePaths: ["$.a[*].b"],
      expected: [
        { node: 2, path: "$.a[0].c" },
        {
          node: 4,
          path: "$.a[1].c",
        },
      ],
    },
  ];

  testCases.forEach(({ name, jsonObject, ignorePaths, expected }) => {
    it(name, () => {
      const result: TestCase["expected"] = [];
      traverseLeafNodesWithIgnores(jsonObject, ignorePaths, (node, path) => {
        result.push({ node, path });
      });
      expect(result).toEqual(expected);
    });
  });
});
