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
      input: "```\nhello\n```",
      expected: { startIndex: 0, endIndex: 13, match: "```\nhello\n```" },
    },
    {
      input: "abc ```\nhello\n```",
      expected: { startIndex: 4, endIndex: 17, match: "```\nhello\n```" },
    },
    {
      input: "abc ```\nhello\n```",
      expected: { startIndex: 4, endIndex: 17, match: "```\nhello\n```" },
    },
    {
      input: "abc ```\nhello\n``` def",
      expected: { startIndex: 4, endIndex: 17, match: "```\nhello\n```" },
    },
    {
      input: "abc ```typescript\nhello\n``` def",
      expected: {
        startIndex: 4,
        endIndex: 27,
        match: "```typescript\nhello\n```",
      },
    },
    {
      input: "abc ```typescript meta\nhello\n``` def",
      expected: {
        startIndex: 4,
        endIndex: 32,
        match: "```typescript meta\nhello\n```",
      },
    },
    {
      input: "abc def hij",
      expected: undefined,
    },
    {
      input: "abc ~~~\nhello\n~~~ def",
      expected: { startIndex: 4, endIndex: 17, match: "~~~\nhello\n~~~" },
      options: { startEndChars: ["~~~", "```"] },
    },
    {
      input: "```hello```",
      expected: undefined,
    },
    {
      input: "```hello\n```",
      expected: undefined,
    },
    {
      input: "```\nhello```",
      expected: undefined,
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
      input: "```\nhello",
      expected: { startIndex: 0, endIndex: 9, match: "```\nhello" },
    },
    {
      input: "abc ```\nhello\n``",
      expected: { startIndex: 4, endIndex: 16, match: "```\nhello\n``" },
    },
    {
      input: "abc ```typescript\nhello\n``",
      expected: {
        startIndex: 4,
        endIndex: 26,
        match: "```typescript\nhello\n``",
      },
    },
    {
      input: "abc ```typescript meta\nhello\n``",
      expected: {
        startIndex: 4,
        endIndex: 31,
        match: "```typescript meta\nhello\n``",
      },
    },
    {
      input: "abc def hij",
      expected: undefined,
    },
    {
      input: "```hello",
      expected: undefined,
    },
    {
      input: "abc ~~~\nhello",
      expected: { startIndex: 4, endIndex: 13, match: "~~~\nhello" },
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
