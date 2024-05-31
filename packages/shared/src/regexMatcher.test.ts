import { describe, expect, it } from "vitest";
import { regexMatcher, regexMatcherGlobal } from "./regexMatcher";

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

describe("regexMatcherGlobal", () => {
  const testCases = [
    {
      input: "hello",
      regex: /hello/g,
      expected: [
        {
          startIndex: 0,
          endIndex: 5,
          outputRaw: "hello",
        },
      ],
    },
    {
      input: "abc hello",
      regex: /hello/g,
      expected: [
        {
          startIndex: 4,
          endIndex: 9,
          outputRaw: "hello",
        },
      ],
    },
    {
      input: "abc hello def",
      regex: /hello/g,
      expected: [
        {
          startIndex: 4,
          endIndex: 9,
          outputRaw: "hello",
        },
      ],
    },
    {
      input: "abc hello def hello",
      regex: /hello/g,
      expected: [
        {
          startIndex: 4,
          endIndex: 9,
          outputRaw: "hello",
        },
        {
          startIndex: 14,
          endIndex: 19,
          outputRaw: "hello",
        },
      ],
    },
    {
      input: "abc yellow def",
      regex: /hello/g,
      expected: [],
    },
  ];

  testCases.forEach(({ input, regex, expected }) => {
    it(`should match ${input} with ${regex}`, () => {
      const result = regexMatcherGlobal(regex)(input);
      expect(result).toEqual(expected);
    });
  });
});
