import { MaybeLLMOutputMatch } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { findCompleteCustomBlock, findPartialCustomBlock } from "./matchers";
import { CustomBlockOptions } from "./options";

type TestCase = {
  name: string;
  input: string;
  expected: MaybeLLMOutputMatch;
  options?: Partial<CustomBlockOptions>;
};

describe("findCompleteCustomBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "opening brace",
      input: "【",
      expected: undefined,
    },
    {
      name: "start of json5",
      input: "【{",
      expected: undefined,
    },
    {
      name: "start of type",
      input: "【{",
      expected: undefined,
    },
    {
      name: "start of type",
      input: "【{t:",
      expected: undefined,
    },
    {
      name: "start of type",
      input: '【{t:"buttons"',
      expected: undefined,
    },
    {
      name: "full custom component",
      input: '【{t:"buttons"}】',
      expected: {
        startIndex: 0,
        endIndex: 15,
        outputRaw: '【{t:"buttons"}】',
      },
    },
    {
      name: "full custom component sandwiched",
      input: 'abc【{t:"buttons"}】def',
      expected: {
        startIndex: 3,
        endIndex: 18,
        outputRaw: '【{t:"buttons"}】',
      },
    },
    {
      name: "full custom component with fields",
      input: '【{t:"buttons", something: "something", else: "else"}】',
      expected: {
        startIndex: 0,
        endIndex: 53,
        outputRaw: '【{t:"buttons", something: "something", else: "else"}】',
      },
    },
    {
      name: "with custom start and end",
      input: '±{t:"buttons", something: "something", else: "else"}§',
      expected: {
        startIndex: 0,
        endIndex: 53,
        outputRaw: '±{t:"buttons", something: "something", else: "else"}§',
      },
      options: {
        startChar: "±",
        endChar: "§",
      },
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = findCompleteCustomBlock("buttons", options)(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("findPartialCustomBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "opening brace",
      input: "【",
      expected: undefined,
    },
    {
      name: "start of json5",
      input: "【{",
      expected: undefined,
    },
    {
      name: "start of type",
      input: "【{",
      expected: undefined,
    },
    {
      name: "start of type",
      input: "【{t:",
      expected: undefined,
    },
    {
      name: "start of type",
      input: '【{t:"buttons"',
      expected: {
        startIndex: 0,
        endIndex: 13,
        outputRaw: '【{t:"buttons"',
      },
    },
    {
      name: "with prefix",
      input: 'other stuff【{t:"buttons"',
      expected: {
        startIndex: 11,
        endIndex: 24,
        outputRaw: '【{t:"buttons"',
      },
    },
    {
      name: "with custom start and end",
      input: 'other stuff±{t:"buttons"',
      expected: {
        startIndex: 11,
        endIndex: 24,
        outputRaw: '±{t:"buttons"',
      },
      options: {
        startChar: "±",
        endChar: "§",
      },
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = findPartialCustomBlock("buttons", options)(input);
      expect(result).toEqual(expected);
    });
  });
});
