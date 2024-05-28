import { LookBack } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { csvBlockLookBack } from "./lookback";
import { CsvBlockOptions } from "./options";

type TestCase = {
  name: string;
  output: string;
  options?: Partial<CsvBlockOptions>;
  isStreamFinished: boolean;
  isComplete: boolean;
  visibleTextLengthTarget: number;
  expected: LookBack;
};

describe("csvBlockLookBack", () => {
  const testCases: TestCase[] = [
    {
      name: "full",
      output: "⦅a⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 1,
      expected: {
        output: "a",
        visibleText: "a",
      },
    },
    {
      name: "delimited",
      output: "⦅abc,def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 6,
      expected: {
        output: "abc,def",
        visibleText: "abcdef",
      },
    },
    {
      name: "delimited custom char",
      output: "⦅abc;def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 6,
      options: { delimiter: ";" },
      expected: {
        output: "abc;def",
        visibleText: "abcdef",
      },
    },
    {
      name: "custom start and end char",
      output: "xabc,defy",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 6,
      options: { startChar: "x", endChar: "y" },
      expected: {
        output: "abc,def",
        visibleText: "abcdef",
      },
    },
    {
      name: "visible text limited",
      output: "⦅abc,def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      expected: {
        output: "abc,de",
        visibleText: "abcde",
      },
    },
    {
      name: "full no visible text",
      output: "⦅abc,def⦆",
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 0,
      expected: {
        output: ",",
        visibleText: "",
      },
    },
    {
      name: "started",
      output: "⦅",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 3,
      expected: {
        output: "",
        visibleText: "",
      },
    },
    {
      name: "partial",
      output: "⦅abc",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 4,
      expected: {
        output: "abc",
        visibleText: "abc",
      },
    },
    {
      name: "partial with delimiter",
      output: "⦅abc,",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 4,
      expected: {
        output: "abc",
        visibleText: "abc",
      },
    },
    {
      name: "partial with second element",
      output: "⦅abc,d",
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 4,
      expected: {
        output: "abc,d",
        visibleText: "abcd",
      },
    },
    {
      name: "allIndexesVisible: false",
      output: "⦅abc,def⦆",
      options: {
        allIndexesVisible: false,
      },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      expected: {
        output: "abc,def",
        visibleText: " ",
      },
    },
    {
      name: "allIndexesVisible: false + partial",
      output: "⦅abc,de",
      options: {
        allIndexesVisible: false,
      },
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 5,
      expected: {
        output: "abc,de",
        visibleText: "",
      },
    },
    {
      name: "visibleIndexes 1st only",
      output: "⦅abc,def⦆",
      options: {
        allIndexesVisible: false,
        visibleIndexes: [0],
      },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      expected: {
        output: "abc,def",
        visibleText: "abc",
      },
    },
    {
      name: "visibleIndexes 0th and 2nd",
      output: "⦅abc,def,ghi⦆",
      options: {
        allIndexesVisible: false,
        visibleIndexes: [0, 2],
      },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 5,
      expected: {
        output: "abc,def,gh",
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
