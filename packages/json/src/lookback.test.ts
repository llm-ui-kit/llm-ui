import { LookBack } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { jsonBlockLookBack } from "./lookback";
import { JsonBlockOptions } from "./options";

type TestCase = {
  name: string;
  output: string;
  options: JsonBlockOptions;
  isStreamFinished: boolean;
  isComplete: boolean;
  visibleTextLengthTarget: number;
  expected: LookBack;
};

describe("jsonBlockLookBack", () => {
  const testCases: TestCase[] = [
    {
      name: "full",
      output: '【{type:"buttons", something: "1234", else: "5678"}】',
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 1,
      options: { type: "buttons" },
      expected: {
        output: JSON.stringify(
          { type: "buttons", something: "1234", else: "5678" },
          null,
          2,
        ),
        visibleText: " ",
      },
    },
    {
      name: "full no visible text",
      output: '【{type:"buttons", something: "1234", else: "5678"}】',
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 0,
      options: { type: "buttons" },
      expected: {
        output: JSON.stringify(
          { type: "buttons", something: "1234", else: "5678" },
          null,
          2,
        ),
        visibleText: "",
      },
    },

    {
      name: "partial",
      output: '【{type:"buttons", something: "1234", else: "',
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 1,
      options: { type: "buttons" },
      expected: {
        output: JSON.stringify(
          { type: "buttons", something: "1234", else: "" },
          null,
          2,
        ),
        visibleText: "",
      },
    },
    {
      name: "partial2",
      output: '【{type:"buttons"',
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 1,
      options: { type: "buttons" },
      expected: {
        output: JSON.stringify({ type: "buttons" }, null, 2),
        visibleText: "",
      },
    },
    {
      name: "visible text",
      output: '【{type:"buttons", something: "1234", else: "5678"}】',
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 3,
      options: { type: "buttons", visibleKeyPaths: ["$.something"] },
      expected: {
        output: JSON.stringify(
          { type: "buttons", something: "123", else: "5678" },
          null,
          2,
        ),
        visibleText: "123",
      },
    },
    {
      name: "visibleKeyPaths",
      output: '【{type:"buttons", something: "1234", else: "5678"}】',
      options: { type: "buttons", visibleKeyPaths: ["$.something"] },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 3,
      expected: {
        output: JSON.stringify(
          { type: "buttons", something: "123", else: "5678" },
          null,
          2,
        ),
        visibleText: "123",
      },
    },
    {
      name: "excludeVisibleKeys",
      output: '【{type:"buttons", something: "1234", else: "5678"}】',
      options: {
        type: "buttons",
        defaultVisible: true,
        invisibleKeyPaths: ["$.else"],
      },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 3,
      expected: {
        output: JSON.stringify(
          { type: "buttons", something: "123", else: "5678" },
          null,
          2,
        ),
        visibleText: "123",
      },
    },
    {
      name: "partial excludeVisibleKeys",
      output: '【{type:"buttons", something',
      options: { type: "buttons", defaultVisible: true },
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 3,
      expected: {
        output: JSON.stringify({ type: "buttons", something: null }, null, 2),
        visibleText: "",
      },
    },
    {
      name: "partial",
      output: '【{type:"buttons", something: "123',
      isStreamFinished: false,
      isComplete: false,
      options: { type: "buttons", visibleKeyPaths: ["$.something"] },
      visibleTextLengthTarget: 2,
      expected: {
        output: JSON.stringify({ type: "buttons", something: "12" }, null, 2),
        visibleText: "12",
      },
    },
    {
      name: "custom type key",
      output: '【{t:"buttons", something: "123',
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 2,
      options: {
        type: "buttons",
        typeKey: "t",
        visibleKeyPaths: ["$.something"],
      },
      expected: {
        output: JSON.stringify({ t: "buttons", something: "12" }, null, 2),
        visibleText: "12",
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
        const result = jsonBlockLookBack(options)({
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
