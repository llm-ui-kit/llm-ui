import { describe, expect, it } from "vitest";
import { regexMatcher } from "./regexMatcher";

describe("regexMatcher", () => {
  const testCases = [
    {
      input: "hello",
      regex: /hello/,
      expected: {
        startIndex: 0,
        endIndex: 5,
        outputRaw: "hello",
      },
    },
    {
      input: "abc hello",
      regex: /hello/,
      expected: {
        startIndex: 4,
        endIndex: 9,
        outputRaw: "hello",
      },
    },
    {
      input: "abc hello def",
      regex: /hello/,
      expected: {
        startIndex: 4,
        endIndex: 9,
        outputRaw: "hello",
      },
    },
    {
      input: "abc yellow def",
      regex: /hello/,
      expected: undefined,
    },
  ];

  testCases.forEach(({ input, regex, expected }) => {
    it(`should match ${input} with ${regex}`, () => {
      const result = regexMatcher(regex)(input);
      expect(result).toEqual(expected);
    });
  });
});
