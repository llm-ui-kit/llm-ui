import { MaybeLLMOutputMatch } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { findCompleteCsvBlock, findPartialCsvBlock } from "./matchers";
import { CsvBlockOptions } from "./options";

type TestCase = {
  name: string;
  input: string;
  expected: MaybeLLMOutputMatch;
  options?: CsvBlockOptions;
};
describe("findCompleteCsvBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single char",
      input: "⦅a⦆",
      expected: {
        startIndex: 0,
        endIndex: 3,
        outputRaw: "⦅a⦆",
      },
    },
    {
      name: "multiple chars",
      input: "⦅abc⦆",
      expected: {
        startIndex: 0,
        endIndex: 5,
        outputRaw: "⦅abc⦆",
      },
    },
    {
      name: "delimited",
      input: "⦅a,b,c⦆",
      expected: {
        startIndex: 0,
        endIndex: 7,
        outputRaw: "⦅a,b,c⦆",
      },
    },
    {
      name: "text before",
      input: "abc⦅a,b,c⦆",
      expected: {
        startIndex: 3,
        endIndex: 10,
        outputRaw: "⦅a,b,c⦆",
      },
    },
    {
      name: "text after",
      input: "⦅a,b,c⦆ def",
      expected: {
        startIndex: 0,
        endIndex: 7,
        outputRaw: "⦅a,b,c⦆",
      },
    },
    {
      name: "text before and after",
      input: "abc⦅a,b,c⦆ def",
      expected: {
        startIndex: 3,
        endIndex: 10,
        outputRaw: "⦅a,b,c⦆",
      },
    },
    {
      name: "not a block",
      input: "```\nhello\n```",
      expected: undefined,
    },
    {
      name: "unfinished block",
      input: "⦅a,b,c",
      expected: undefined,
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = findCompleteCsvBlock(options)(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("findPartialCsvBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single char",
      input: "⦅a",
      expected: {
        startIndex: 0,
        endIndex: 2,
        outputRaw: "⦅a",
      },
    },
    {
      name: "multiple chars",
      input: "⦅abc",
      expected: {
        startIndex: 0,
        endIndex: 4,
        outputRaw: "⦅abc",
      },
    },
    {
      name: "delimited",
      input: "⦅a,b,c",
      expected: {
        startIndex: 0,
        endIndex: 6,
        outputRaw: "⦅a,b,c",
      },
    },
    {
      name: "text before",
      input: "abc⦅a,b,c",
      expected: {
        startIndex: 3,
        endIndex: 9,
        outputRaw: "⦅a,b,c",
      },
    },
    {
      name: "not a block",
      input: "```\nhello\n```",
      expected: undefined,
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = findPartialCsvBlock(options)(input);
      expect(result).toEqual(expected);
    });
  });
});
