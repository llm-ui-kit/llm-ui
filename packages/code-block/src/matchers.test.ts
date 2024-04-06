import { describe, expect, it } from "vitest";
import { MaybeLLMOutputMatch } from "../../react/src/components/LLMOutput/types";
import {
  MarkdownMatcherOptions,
  matchFullMarkdownCodeBlock,
  matchPartialMarkdownCodeBlock,
  regexMatcher,
} from "./matchers";

describe("regexMatcher", () => {
  const testCases = [
    {
      input: "hello",
      regex: /hello/,
      expected: { startIndex: 0, endIndex: 5, match: "hello" },
    },
    {
      input: "abc hello",
      regex: /hello/,
      expected: { startIndex: 4, endIndex: 9, match: "hello" },
    },
    {
      input: "abc hello def",
      regex: /hello/,
      expected: { startIndex: 4, endIndex: 9, match: "hello" },
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

describe("matchFullMarkdownCodeBlock", () => {
  const testCases: {
    input: string;
    expected: MaybeLLMOutputMatch;
    options?: MarkdownMatcherOptions;
  }[] = [
    {
      input: "```hello```",
      expected: { startIndex: 0, endIndex: 11, match: "```hello```" },
    },
    {
      input: "abc ```hello```",
      expected: { startIndex: 4, endIndex: 15, match: "```hello```" },
    },
    {
      input: "abc ```hello``` def",
      expected: { startIndex: 4, endIndex: 15, match: "```hello```" },
    },
    {
      input: "abc def hij",
      expected: undefined,
    },
    {
      input: "abc ~~~hello~~~ def",
      expected: { startIndex: 4, endIndex: 15, match: "~~~hello~~~" },
      options: { startEndChars: ["~~~", "```"] },
    },
  ];

  testCases.forEach(({ input, expected, options }) => {
    it(`should match ${input}`, () => {
      const result = matchFullMarkdownCodeBlock(options)(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("matchPartialMarkdownCodeBlock", () => {
  const testCases: {
    input: string;
    expected: MaybeLLMOutputMatch;
    options?: MarkdownMatcherOptions;
  }[] = [
    {
      input: "```hello",
      expected: { startIndex: 0, endIndex: 8, match: "```hello" },
    },
    {
      input: "abc ```hello``",
      expected: { startIndex: 4, endIndex: 14, match: "```hello``" },
    },
    {
      input: "abc def hij",
      expected: undefined,
    },
    {
      input: "abc ~~~hello",
      expected: { startIndex: 4, endIndex: 12, match: "~~~hello" },
      options: { startEndChars: ["~~~", "```"] },
    },
  ];

  testCases.forEach(({ input, expected, options }) => {
    it(`should match ${input}`, () => {
      const result = matchPartialMarkdownCodeBlock(options)(input);
      expect(result).toEqual(expected);
    });
  });
});
