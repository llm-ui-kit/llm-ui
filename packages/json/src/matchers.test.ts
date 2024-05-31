import { MaybeLLMOutputMatch } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { findCompleteJsonBlock, findPartialJsonBlock } from "./matchers";
import { JsonBlockOptions } from "./options";

type TestCase = {
  name: string;
  input: string;
  expected: MaybeLLMOutputMatch;
  options: JsonBlockOptions;
};

describe("findCompleteJsonBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "opening brace",
      input: "【",
      options: { type: "buttons" },
      expected: undefined,
    },
    {
      name: "start of json5",
      input: "【{",
      options: { type: "buttons" },
      expected: undefined,
    },
    {
      name: "start of type",
      input: "【{",
      options: { type: "buttons" },
      expected: undefined,
    },
    {
      name: "start of type",
      input: "【{type:",
      options: { type: "buttons" },
      expected: undefined,
    },
    {
      name: "start of type",
      input: '【{type:"buttons"',
      options: { type: "buttons" },
      expected: undefined,
    },
    {
      name: "full custom component",
      input: '【{type:"buttons"}】',
      options: { type: "buttons" },
      expected: {
        startIndex: 0,
        endIndex: 18,
        outputRaw: '【{type:"buttons"}】',
      },
    },
    {
      name: "full custom component sandwiched",
      input: 'abc【{type:"buttons"}】def',
      options: { type: "buttons" },
      expected: {
        startIndex: 3,
        endIndex: 21,
        outputRaw: '【{type:"buttons"}】',
      },
    },
    {
      name: "full custom same component twice",
      input: '【{type:"buttons"}】【{type:"buttons"}】',
      options: { type: "buttons" },
      expected: {
        startIndex: 0,
        endIndex: 18,
        outputRaw: '【{type:"buttons"}】',
      },
    },
    {
      name: "full custom 2 different components",
      input: '【{type:"buttons"}】【{type:"somethingelse"}】',
      options: { type: "buttons" },
      expected: {
        startIndex: 0,
        endIndex: 18,
        outputRaw: '【{type:"buttons"}】',
      },
    },
    {
      name: "full custom 2 different components reversed",
      input: '【{type:"somethingelse"}】【{type:"buttons"}】',
      options: { type: "buttons" },
      expected: {
        startIndex: 24,
        endIndex: 42,
        outputRaw: '【{type:"buttons"}】',
      },
    },
    {
      name: "full custom component with fields",
      input: '【{type:"buttons", something: "something", else: "else"}】',
      options: { type: "buttons" },
      expected: {
        startIndex: 0,
        endIndex: 56,
        outputRaw: '【{type:"buttons", something: "something", else: "else"}】',
      },
    },
    {
      name: "full custom component with fields sandwiched",
      input:
        'the start【{type:"buttons", something: "something", else: "else"}】keeps going',
      options: { type: "buttons" },
      expected: {
        startIndex: 9,
        endIndex: 65,
        outputRaw: '【{type:"buttons", something: "something", else: "else"}】',
      },
    },
    {
      name: "custom type key",
      input: '【{t:"buttons", something: "something", else: "else"}】',
      options: {
        type: "buttons",
        typeKey: "t",
      },
      expected: {
        startIndex: 0,
        endIndex: 53,
        outputRaw: '【{t:"buttons", something: "something", else: "else"}】',
      },
    },
    {
      name: "with custom start and end",
      input: '±{type:"buttons", something: "something", else: "else"}§',
      options: {
        type: "buttons",
        startChar: "±",
        endChar: "§",
      },
      expected: {
        startIndex: 0,
        endIndex: 56,
        outputRaw: '±{type:"buttons", something: "something", else: "else"}§',
      },
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = findCompleteJsonBlock(options)(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("findPartialJsonBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "opening brace",
      input: "【",
      expected: undefined,
      options: { type: "buttons" },
    },
    {
      name: "start of json5",
      input: "【{",
      expected: undefined,
      options: { type: "buttons" },
    },
    {
      name: "start of type",
      input: "【{",
      expected: undefined,
      options: { type: "buttons" },
    },
    {
      name: "start of type",
      input: "【{t:",
      expected: undefined,
      options: { type: "buttons" },
    },
    {
      name: "start of type",
      input: '【{type:"buttons"',
      options: { type: "buttons" },
      expected: {
        startIndex: 0,
        endIndex: 16,
        outputRaw: '【{type:"buttons"',
      },
    },
    {
      name: "with prefix",
      input: 'other stuff【{type:"buttons"',
      options: { type: "buttons" },
      expected: {
        startIndex: 11,
        endIndex: 27,
        outputRaw: '【{type:"buttons"',
      },
    },
    {
      name: "with custom start and end",
      input: 'other stuff±{type:"buttons"',
      expected: {
        startIndex: 11,
        endIndex: 27,
        outputRaw: '±{type:"buttons"',
      },
      options: {
        type: "buttons",
        startChar: "±",
        endChar: "§",
      },
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = findPartialJsonBlock(options)(input);
      expect(result).toEqual(expected);
    });
  });
});
