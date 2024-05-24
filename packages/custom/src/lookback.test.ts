import { LookBack } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { customBlockLookBack } from "./lookback";
import { CustomBlockOptions } from "./options";

type TestCase = {
  name: string;
  output: string;
  options?: Partial<CustomBlockOptions>;
  isStreamFinished: boolean;
  isComplete: boolean;
  visibleTextLengthTarget: number;
  expected: LookBack;
};

describe("customBlockLookBack", () => {
  const testCases: TestCase[] = [
    {
      name: "full",
      output: '【{t:"buttons", something: "1234", else: "5678"}】',
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 8,
      expected: {
        output: JSON.stringify(
          { t: "buttons", something: "1234", else: "5678" },
          null,
          2,
        ),
        visibleText: "12345678",
      },
    },
    {
      name: "visible text",
      output: '【{t:"buttons", something: "1234", else: "5678"}】',
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 3,
      expected: {
        output: JSON.stringify(
          { t: "buttons", something: "123", else: "" },
          null,
          2,
        ),
        visibleText: "123",
      },
    },
    {
      name: "excludeVisibleKeys",
      output: '【{t:"buttons", something: "1234", else: "5678"}】',
      options: { invisibleKeyPaths: ["$.else"] },
      isStreamFinished: true,
      isComplete: true,
      visibleTextLengthTarget: 3,
      expected: {
        output: JSON.stringify(
          { t: "buttons", something: "123", else: "5678" },
          null,
          2,
        ),
        visibleText: "123",
      },
    },
    {
      name: "partial",
      output: '【{t:"buttons", something: "123',
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 2,
      expected: {
        output: JSON.stringify({ t: "buttons", something: "12" }, null, 2),
        visibleText: "12",
      },
    },
    {
      name: "custom type key",
      output: '【{type:"buttons", something: "123',
      isStreamFinished: false,
      isComplete: false,
      visibleTextLengthTarget: 2,
      options: { typeKey: "type" },
      expected: {
        output: JSON.stringify({ type: "buttons", something: "12" }, null, 2),
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
        const result = customBlockLookBack(
          "buttons",
          options,
        )({ output, isStreamFinished, visibleTextLengthTarget, isComplete });
        expect(result).toEqual(expected);
      });
    },
  );
});
