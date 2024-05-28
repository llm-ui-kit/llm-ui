import { describe, expect, it } from "vitest";
import { CsvBlockOptions, getOptions } from "./options";

type TestCase = {
  name: string;
  options?: Partial<CsvBlockOptions>;
  expectError: boolean;
};

describe("getOptions", () => {
  const testCases: TestCase[] = [
    {
      name: "valid options do not error 1 ",
      options: undefined,
      expectError: false,
    },
    {
      name: "valid options do not error 2 ",
      options: { startChar: "a", endChar: "b" },
      expectError: false,
    },
    {
      name: "valid options do not error 3",
      options: { allIndexesVisible: true },
      expectError: false,
    },
    {
      name: "allIndexesVisible: true, visibleIndexes: [1] errors",
      options: { allIndexesVisible: true, visibleIndexes: [1] },
      expectError: true,
    },
    {
      name: "allIndexesVisible: false, visibleIndexes: [1] ok",
      options: { allIndexesVisible: false, visibleIndexes: [1] },
      expectError: false,
    },
  ];

  testCases.forEach(({ name, options, expectError }) => {
    it(name, () => {
      if (expectError) {
        expect(() => {
          getOptions(options);
        }).toThrowError();
      } else {
        getOptions(options);
      }
    });
  });
});
