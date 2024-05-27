import { describe, expect, it } from "vitest";
import { setJsonPath } from "./jsonPathSet";

type TestCase = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonObject: any;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expected: any;
};

describe("setJsonPath", () => {
  const testCases: TestCase[] = [
    {
      name: "top level key",
      jsonObject: { a: 1 },
      path: "$.a",
      newValue: 2,
      expected: { a: 2 },
    },
    {
      name: "nested key",
      jsonObject: { a: { b: 1 } },
      path: "$.a.b",
      newValue: 2,
      expected: { a: { b: 2 } },
    },
    {
      name: "nested array",
      jsonObject: { a: { b: [1, 2] } },
      path: "$.a.b[1]",
      newValue: 3,
      expected: { a: { b: [1, 3] } },
    },
  ];

  testCases.forEach(({ name, jsonObject, path, newValue, expected }) => {
    it(name, () => {
      setJsonPath(jsonObject, path, newValue);
      expect(jsonObject).toEqual(expected);
    });
  });
});
