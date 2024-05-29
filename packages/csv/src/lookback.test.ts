import { LookBack } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { csvBlockLookBack } from "./lookback";
import { CsvBlockOptions } from "./options";

type TestCase = {
  name: string;
  output: string;
  options: CsvBlockOptions;
  isStreamFinished: boolean;
  isComplete: boolean;
  visibleTextLengthTarget: number;
  expected: LookBack;
};

describe("csvBlockLookBack", () => {
  const testCases: TestCase[] = [
    {
      name: "full",
      output: "⦅t,a⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 1,
      options: { type: "t" },
      expected: {
        output: "t,a",
        visibleText: "a",
      },
    },
    {
      name: "delimited",
      output: "⦅t,abc,def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 6,
      options: { type: "t" },
      expected: {
        output: "t,abc,def",
        visibleText: "abcdef",
      },
    },
    {
      name: "delimited custom char",
      output: "⦅t;abc;def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 6,
      options: { type: "t", delimiter: ";" },
      expected: {
        output: "t;abc;def",
        visibleText: "abcdef",
      },
    },
    {
      name: "custom start and end char",
      output: "xt,abc,defy",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 6,
      options: { type: "t", startChar: "x", endChar: "y" },
      expected: {
        output: "t,abc,def",
        visibleText: "abcdef",
      },
    },
    {
      name: "custom type",
      output: "⦅type,abc,def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 6,
      options: { type: "type" },
      expected: {
        output: "type,abc,def",
        visibleText: "abcdef",
      },
    },
    {
      name: "visible text limited",
      output: "⦅t,abc,def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      options: { type: "t" },
      expected: {
        output: "t,abc,de",
        visibleText: "abcde",
      },
    },
    {
      name: "full no visible text",
      output: "⦅t,abc,def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 0,
      options: { type: "t" },
      expected: {
        output: "t,,",
        visibleText: "",
      },
    },
    {
      name: "started",
      output: "⦅t,",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 3,
      options: { type: "t" },
      expected: {
        output: "t",
        visibleText: "",
      },
    },
    {
      name: "partial",
      output: "⦅t,abc",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 4,
      options: { type: "t" },
      expected: {
        output: "t,abc",
        visibleText: "abc",
      },
    },
    {
      name: "partial with delimiter",
      output: "⦅t;abc;",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 4,
      options: { type: "t", delimiter: ";" },
      expected: {
        output: "t;abc",
        visibleText: "abc",
      },
    },
    {
      name: "partial with second element",
      output: "⦅t,abc,d",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 4,
      options: { type: "t" },
      expected: {
        output: "t,abc,d",
        visibleText: "abcd",
      },
    },
    {
      name: "allIndexesVisible: false",
      output: "⦅t,abc,def⦆",
      options: {
        type: "t",
        allIndexesVisible: false,
      },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      expected: {
        output: "t,abc,def",
        visibleText: " ",
      },
    },
    {
      name: "allIndexesVisible: false + partial",
      output: "⦅t,abc,de",
      options: {
        type: "t",
        allIndexesVisible: false,
      },
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 5,
      expected: {
        output: "t,abc,de",
        visibleText: "",
      },
    },
    {
      name: "visibleIndexes 1st only",
      output: "⦅t,abc,def⦆",
      options: {
        type: "t",
        allIndexesVisible: false,
        visibleIndexes: [1],
      },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      expected: {
        output: "t,abc,def",
        visibleText: "abc",
      },
    },
    {
      name: "visibleIndexes 0th and 2nd",
      output: "⦅t,abc,def,ghi⦆",
      options: {
        type: "t",
        allIndexesVisible: false,
        visibleIndexes: [1, 3],
      },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      expected: {
        output: "t,abc,def,gh",
        visibleText: "abcgh",
      },
    },
  ];

  testCases.forEach(
    ({
      name,
      output,
      expected,
      options,
      isStreamFinished,
      isComplete,
      visibleTextLengthTarget,
    }) => {
      it(name, () => {
        const result = csvBlockLookBack(options)({
          output,
          isStreamFinished,
          visibleTextLengthTarget,
          isComplete,
        });
        expect(result).toEqual(expected);
      });
    },
  );
});
