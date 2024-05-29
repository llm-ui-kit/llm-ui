/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from "vitest";
import { JsonBlockOptions, getOptions } from "./options";

type TestCase = {
  name: string;
  options: JsonBlockOptions;
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
      options: { type: "buttons", typeKey: "t" },
      expectError: false,
    },
    {
      name: "no type errors",
      // @ts-expect-error
      options: { typeKey: "t" },
      expectError: true,
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
