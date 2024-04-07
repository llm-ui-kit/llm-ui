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

type TestCase = {
  name: string;
  input: string;
  expected: MaybeLLMOutputMatch;
  options?: MarkdownMatcherOptions;
};
describe("matchFullMarkdownCodeBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single loc",
      input: "```\nhello\n```",
      expected: { startIndex: 0, endIndex: 13, match: "```\nhello\n```" },
    },
    {
      name: "single loc, other text before",
      input: "abc ```\nhello\n```",
      expected: { startIndex: 4, endIndex: 17, match: "```\nhello\n```" },
    },
    {
      name: "single loc, other text before and after",
      input: "abc ```\nhello\n``` def",
      expected: { startIndex: 4, endIndex: 17, match: "```\nhello\n```" },
    },
    {
      name: "single loc with language",
      input: "abc ```typescript\nhello\n``` def",
      expected: {
        startIndex: 4,
        endIndex: 27,
        match: "```typescript\nhello\n```",
      },
    },
    {
      name: "single loc with language and meta",
      input: "abc ```typescript meta\nhello\n``` def",
      expected: {
        startIndex: 4,
        endIndex: 32,
        match: "```typescript meta\nhello\n```",
      },
    },
    {
      name: "not a code block",
      input: "abc def hij",
      expected: undefined,
    },
    {
      name: "custom startEndChars",
      input: "abc ~~~\nhello\n~~~ def",
      expected: { startIndex: 4, endIndex: 17, match: "~~~\nhello\n~~~" },
      options: { startEndChars: ["~~~", "```"] },
    },
    {
      name: "single line start and end (not valid block)",
      input: "```hello```",
      expected: undefined,
    },
    {
      name: "2 line code block (not valid block) 1",
      input: "```hello\n```",
      expected: undefined,
    },
    {
      name: "2 line code block (not valid block) 2",
      input: "```\nhello```",
      expected: undefined,
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = matchFullMarkdownCodeBlock(options)(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("matchPartialMarkdownCodeBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single loc",
      input: "```\nhello",
      expected: { startIndex: 0, endIndex: 9, match: "```\nhello" },
    },
    {
      name: "nearly finished block",
      input: "abc ```\nhello\n``",
      expected: { startIndex: 4, endIndex: 16, match: "```\nhello\n``" },
    },
    {
      name: "nearly finished block with language",
      input: "abc ```typescript\nhello\n``",
      expected: {
        startIndex: 4,
        endIndex: 26,
        match: "```typescript\nhello\n``",
      },
    },
    {
      name: "nearly finished block with language and meta",
      input: "abc ```typescript meta\nhello\n``",
      expected: {
        startIndex: 4,
        endIndex: 31,
        match: "```typescript meta\nhello\n``",
      },
    },
    {
      name: "not a code block",
      input: "abc def hij",
      expected: undefined,
    },
    {
      name: "single line start (not valid block)",
      input: "```hello",
      expected: undefined,
    },
    {
      name: "custom startEndChars",
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
