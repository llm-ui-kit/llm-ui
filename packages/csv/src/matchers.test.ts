import { MaybeLLMOutputMatch } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { findCompleteCsvBlock, findPartialCsvBlock } from "./matchers";
import { CsvBlockOptions } from "./options";

type TestCase = {
  name: string;
  input: string;
  expected: MaybeLLMOutputMatch;
  options: CsvBlockOptions;
};
describe("findCompleteCsvBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single char",
      input: "⦅t,a⦆",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 5,
        outputRaw: "⦅t,a⦆",
      },
    },
    {
      name: "multiple chars",
      input: "⦅t,abc⦆",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 7,
        outputRaw: "⦅t,abc⦆",
      },
    },
    {
      name: "delimited",
      input: "⦅t,a,b,c⦆",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 9,
        outputRaw: "⦅t,a,b,c⦆",
      },
    },
    {
      name: "custom type",
      input: "⦅type,a,b,c⦆",
      options: { type: "type" },
      expected: {
        startIndex: 0,
        endIndex: 12,
        outputRaw: "⦅type,a,b,c⦆",
      },
    },
    {
      name: "text before",
      input: "abc⦅t,a,b,c⦆",
      options: { type: "t" },
      expected: {
        startIndex: 3,
        endIndex: 12,
        outputRaw: "⦅t,a,b,c⦆",
      },
    },
    {
      name: "text after",
      input: "⦅t,a,b,c⦆ def",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 9,
        outputRaw: "⦅t,a,b,c⦆",
      },
    },
    {
      name: "text before and after",
      input: "abc⦅t,a,b,c⦆ def",
      options: { type: "t" },
      expected: {
        startIndex: 3,
        endIndex: 12,
        outputRaw: "⦅t,a,b,c⦆",
      },
    },
    {
      name: "two same type blocks",
      input: "⦅t,a,b,c⦆⦅t,a,b,c⦆",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 9,
        outputRaw: "⦅t,a,b,c⦆",
      },
    },
    {
      name: "two different blocks",
      input: "⦅t,a,b,c⦆⦅z,a,b,c⦆",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 9,
        outputRaw: "⦅t,a,b,c⦆",
      },
    },
    {
      name: "two different blocks reversed",
      input: "⦅z,a,b,c⦆⦅t,a,b,c⦆",
      options: { type: "t" },
      expected: {
        startIndex: 9,
        endIndex: 18,
        outputRaw: "⦅t,a,b,c⦆",
      },
    },
    {
      name: "not a block",
      input: "```\nhello\n```",
      options: { type: "t" },
      expected: undefined,
    },
    {
      name: "unfinished block",
      input: "⦅t,a,b,c",
      options: { type: "t" },
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
      name: "opening bracket",
      input: "⦅",
      options: { type: "t" },
      expected: undefined,
    },
    {
      name: "opening bracket + type",
      input: "⦅t",
      options: { type: "t" },
      expected: undefined,
    },
    {
      name: "opening bracket + type + delimiter",
      input: "⦅t,",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 3,
        outputRaw: "⦅t,",
      },
    },
    {
      name: "custom type",
      input: "⦅type,",
      options: { type: "type" },
      expected: {
        startIndex: 0,
        endIndex: 6,
        outputRaw: "⦅type,",
      },
    },
    {
      name: "delimited",
      input: "⦅t,a,b,c",
      options: { type: "t" },
      expected: {
        startIndex: 0,
        endIndex: 8,
        outputRaw: "⦅t,a,b,c",
      },
    },
    {
      name: "text before",
      input: "abc⦅t,a,b,c",
      options: { type: "t" },
      expected: {
        startIndex: 3,
        endIndex: 11,
        outputRaw: "⦅t,a,b,c",
      },
    },
    {
      name: "not a block",
      input: "```\nhello\n```",
      options: { type: "t" },
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
