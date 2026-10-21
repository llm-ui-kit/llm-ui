import { afterEach, describe, expect, it } from "vitest";
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

describe("setJsonPath prototype pollution", () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (Object.prototype as any).polluted;
  });

  it("does not decode a percent-encoded __proto__ key", () => {
    const jsonObject = JSON.parse('{"__proto%5f%5f": {"polluted": "a"}}');
    setJsonPath(jsonObject, "$.__proto%5f%5f.polluted", "PWNED");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(({} as any).polluted).toBeUndefined();
    expect(jsonObject["__proto%5f%5f"].polluted).toBe("PWNED");
  });

  it("keeps a plain __proto__ key as an own property", () => {
    const jsonObject = JSON.parse('{"__proto__": {"polluted": "a"}}');
    setJsonPath(jsonObject, "$.__proto__.polluted", "PWNED");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(({} as any).polluted).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(jsonObject, "__proto__")?.value,
    ).toEqual({ polluted: "PWNED" });
  });

  it("sets keys containing % literally", () => {
    const jsonObject = { "100%": "a", "a%20b": "b" };
    setJsonPath(jsonObject, "$.100%", "c");
    setJsonPath(jsonObject, "$.a%20b", "d");
    expect(jsonObject).toEqual({ "100%": "c", "a%20b": "d" });
  });
});
