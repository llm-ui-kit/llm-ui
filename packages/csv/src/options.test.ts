/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from "vitest";
import { CsvBlockOptions, getOptions } from "./options";

type TestCase = {
  name: string;
  options: CsvBlockOptions;
  expectError: boolean;
};

describe("getOptions", () => {
  const testCases: TestCase[] = [
    {
      name: "valid options do not error 1 ",
      options: { type: "buttons" },
      expectError: false,
    },
    {
      name: "valid options do not error 2 ",
      options: { type: "buttons", startChar: "a", endChar: "b" },
      expectError: false,
    },
    {
      name: "valid options do not error 3",
      options: { type: "buttons", allIndexesVisible: true },
      expectError: false,
    },
    {
      name: "no type errors",
      // @ts-expect-error
      options: {},
      expectError: true,
    },
    {
      name: "allIndexesVisible: true, visibleIndexes: [1] errors",
      options: {
        type: "buttons",
        allIndexesVisible: true,
        visibleIndexes: [1],
      },
      expectError: true,
    },
    {
      name: "allIndexesVisible: false, visibleIndexes: [1] ok",
      options: {
        type: "buttons",
        allIndexesVisible: false,
        visibleIndexes: [1],
      },
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
