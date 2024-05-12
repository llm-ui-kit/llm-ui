import { LookBack } from "@llm-ui/react";
import { describe, expect, it } from "vitest";
import { codeBlockLookBack } from "./lookBack";
import { CodeBlockOptions } from "./options";

type TestCase = {
  name: string;
  isComplete: boolean;
  codeBlock: string;
  visibleTextLengthTarget: number;
  options?: CodeBlockOptions;
  expected: LookBack;
};

describe("codeBlockLookBack", () => {
  const testCases: TestCase[] = [
    {
      name: "single loc",
      isComplete: true,
      codeBlock: "```\nhello\n```",
      visibleTextLengthTarget: 5,
      expected: { output: "```\nhello\n```", visibleText: "hello" },
    },
    {
      name: "single loc",
      isComplete: true,
      codeBlock: "```\nhello\n```",
      visibleTextLengthTarget: 6,
      expected: { output: "```\nhello\n```", visibleText: "hello" },
    },
    {
      name: "empty",
      isComplete: true,
      codeBlock: "```\n\n```",
      visibleTextLengthTarget: 0,
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "empty target: 1",
      isComplete: true,
      codeBlock: "```\n\n```",
      visibleTextLengthTarget: 1,
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "single loc with newlines",
      isComplete: true,
      codeBlock: "```\n\nhello\n\n```",
      visibleTextLengthTarget: 7,
      expected: {
        output: "```\n\nhello\n\n```",
        visibleText: "\nhello\n",
      },
    },
    {
      name: "single line start and end (not valid block)",
      isComplete: true,
      codeBlock: "``````",
      visibleTextLengthTarget: 7,
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "single loc with language",
      isComplete: true,
      codeBlock: "```javascript\nhello\n```",
      visibleTextLengthTarget: 7,
      expected: {
        output: "```javascript\nhello\n```",
        visibleText: "hello",
      },
    },
    {
      name: "single loc with language and meta",
      isComplete: true,
      codeBlock: "```javascript meta123\nhello\n```",
      visibleTextLengthTarget: 3,
      expected: {
        output: "```javascript meta123\nhel\n```",
        visibleText: "hel",
      },
    },
    {
      name: "single loc with language, meta 2",
      isComplete: true,
      codeBlock: "```typescript meta123\nconsole.log('hello')\n```",
      visibleTextLengthTarget: 3,
      expected: {
        output: "```typescript meta123\ncon\n```",
        visibleText: "con",
      },
    },
    {
      name: "custom startEndChars",
      isComplete: true,
      codeBlock: "~~~typescript meta123\nconsole.log('hello')\n~~~",
      visibleTextLengthTarget: 3,
      options: { startEndChars: ["~", "`"] },
      expected: {
        output: "~~~typescript meta123\ncon\n~~~",
        visibleText: "con",
      },
    },
    {
      name: "custom startEndChars 2",
      isComplete: true,
      codeBlock: "```typescript meta123\nconsole.log('hello')\n```",
      visibleTextLengthTarget: 3,
      options: { startEndChars: ["~", "`"] },
      expected: {
        output: "~~~typescript meta123\ncon\n~~~", // this ok, but should be backticks
        visibleText: "con",
      },
    },
    {
      name: "partial",
      isComplete: false,
      visibleTextLengthTarget: 5,
      codeBlock: "```\nhello\n",
      expected: {
        output: "```\nhello\n```",
        visibleText: "hello",
      },
    },
    {
      name: "partial with 1 newlines",
      isComplete: false,
      visibleTextLengthTarget: 3,
      codeBlock: "```\n",
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "partial with 2 newlines",
      isComplete: false,
      visibleTextLengthTarget: 3,
      codeBlock: "```\n\n",
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "partial with 2 newlines and a character",
      isComplete: false,
      visibleTextLengthTarget: 2,
      codeBlock: "```\n\nc",
      expected: {
        output: "```\n\nc\n```",
        visibleText: "\nc",
      },
    },
    {
      name: "partial with language",
      isComplete: false,
      codeBlock: "```javascript\nhello",
      visibleTextLengthTarget: 6,
      expected: {
        output: "```javascript\nhello\n```",
        visibleText: "hello",
      },
    },
    {
      name: "partial with language and meta",
      isComplete: false,
      codeBlock: "```javascript meta123\nhello",
      visibleTextLengthTarget: 4,
      expected: {
        output: "```javascript meta123\nhell\n```",
        visibleText: "hell",
      },
    },
    {
      name: "partial with language, meta, 1 loc",
      isComplete: false,
      codeBlock: "```typescript meta123\nconsole.log('hello')",
      visibleTextLengthTarget: 3,
      expected: {
        output: "```typescript meta123\ncon\n```",
        visibleText: "con",
      },
    },
    {
      name: "partial with language, meta, 1 loc, newline and half of next line",
      isComplete: false,
      codeBlock: "```typescript meta123\nconsole.log('hello')\nconsol",
      visibleTextLengthTarget: 100,
      expected: {
        output: "```typescript meta123\nconsole.log('hello')\nconsol\n```",
        visibleText: "console.log('hello')\nconsol",
      },
    },
    {
      name: "partial with language, meta, 1 loc, newline and 2 backticks",
      isComplete: false,
      codeBlock: "```typescript meta123\nconsole.log('hello')\n``",
      visibleTextLengthTarget: 100,
      expected: {
        output: "```typescript meta123\nconsole.log('hello')\n```",
        visibleText: "console.log('hello')",
      },
    },
    {
      name: "starting block 1 char",
      isComplete: false,
      codeBlock: "`",
      visibleTextLengthTarget: 100,
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "starting block 2 char",
      isComplete: false,
      codeBlock: "``",
      visibleTextLengthTarget: 100,
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "starting block 3 char",
      isComplete: false,
      codeBlock: "```",
      visibleTextLengthTarget: 100,
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "starting then not a block",
      isComplete: false,
      codeBlock: "`abc",
      visibleTextLengthTarget: 100,
      expected: {
        output: "```\n\n```",
        visibleText: "",
      },
    },
    {
      name: "ending block 1 char",
      isComplete: false,
      codeBlock: "```\nhello\n`",
      visibleTextLengthTarget: 3,
      expected: {
        output: "```\nhel\n```",
        visibleText: "hel",
      },
    },
    {
      name: "ending block 2 char",
      isComplete: false,
      codeBlock: "```\nhello\n``",
      visibleTextLengthTarget: 3,
      expected: {
        output: "```\nhel\n```",
        visibleText: "hel",
      },
    },
  ];

  testCases.forEach(
    ({
      name,
      isComplete,
      codeBlock,
      visibleTextLengthTarget,
      options,
      expected,
    }) => {
      it(name, () => {
        const result = codeBlockLookBack(options)({
          isComplete,
          isStreamFinished: false,
          output: codeBlock,
          visibleTextLengthTarget,
        });
        expect(result).toEqual(expected);
      });
    },
  );
});
