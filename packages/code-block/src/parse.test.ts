import { describe, expect, it } from "vitest";
import { CodeBlockOptions } from "./options";
import {
  CodeBlock,
  parseCompleteMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";

type TestCase = {
  name: string;
  codeBlock: string;
  options?: CodeBlockOptions;
  expected: CodeBlock;
};

describe("parseCompleteMarkdownCodeBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single loc",
      codeBlock: "```\nhello\n```",
      expected: { code: "hello", language: undefined, metaString: undefined },
    },
    {
      name: "empty",
      codeBlock: "```\n\n```",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "single loc with newlines",
      codeBlock: "```\n\nhello\n\n```",
      expected: {
        code: "\nhello\n",
        language: undefined,
        metaString: undefined,
      },
    },
    {
      name: "single line start and end (not valid block)",
      codeBlock: "``````",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "single loc with language",
      codeBlock: "```javascript\nhello\n```",
      expected: {
        code: "hello",
        language: "javascript",
        metaString: undefined,
      },
    },
    {
      name: "single loc with language and meta",
      codeBlock: "```javascript meta123\nhello\n```",
      expected: {
        code: "hello",
        language: "javascript",
        metaString: "meta123",
      },
    },
    {
      name: "single loc with language, meta 2",
      codeBlock: "```typescript meta123\nconsole.log('hello')\n```",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      name: "custom startEndChars",
      codeBlock: "~~~typescript meta123\nconsole.log('hello')\n~~~",
      options: { startEndChars: ["~", "`"] },
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
  ];

  testCases.forEach(({ name, codeBlock, options, expected }) => {
    it(name, () => {
      const result = parseCompleteMarkdownCodeBlock(codeBlock, options);
      expect(result).toEqual(expected);
    });
  });
});

describe("parsePartialMarkdownCodeBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "partial",
      codeBlock: "```\nhello\n",
      expected: { code: "hello", language: undefined, metaString: undefined },
    },
    {
      name: "partial with 1 newlines",
      codeBlock: "```\n",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "partial with 2 newlines",
      codeBlock: "```\n\n",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "partial with 2 newlines and a character",
      codeBlock: "```\n\nc",
      expected: { code: "\nc", language: undefined, metaString: undefined },
    },
    {
      name: "single line complete",
      codeBlock: "``````",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "partial with language",
      codeBlock: "```javascript\nhello",
      expected: {
        code: "hello",
        language: "javascript",
        metaString: undefined,
      },
    },
    {
      name: "partial with language and meta",
      codeBlock: "```javascript meta123\nhello",
      expected: {
        code: "hello",
        language: "javascript",
        metaString: "meta123",
      },
    },
    {
      name: "partial with language, meta, 1 loc",
      codeBlock: "```typescript meta123\nconsole.log('hello')",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      name: "partial with language, meta, 1 loc and newline",
      codeBlock: "```typescript meta123\nconsole.log('hello')",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      name: "partial with language, meta, 1 loc, newline and half of next line",
      codeBlock: "```typescript meta123\nconsole.log('hello')\nconsol",
      expected: {
        code: "console.log('hello')\nconsol",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      name: "partial with language, meta, 1 loc, newline and 2 backticks",
      codeBlock: "```typescript meta123\nconsole.log('hello')\n``",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      name: "starting block 1 char",
      codeBlock: "`",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "starting block 2 char",
      codeBlock: "``",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "starting block 3 char",
      codeBlock: "```",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "starting then not a block",
      codeBlock: "`abc",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "ending block 1 char",
      codeBlock: "```\nhello\n`",
      expected: { code: "hello", language: undefined, metaString: undefined },
    },
    {
      name: "ending block 2 char",
      codeBlock: "```\nhello\n``",
      expected: { code: "hello", language: undefined, metaString: undefined },
    },
  ];

  testCases.forEach(({ name, codeBlock, options, expected }) => {
    it(name, () => {
      const result = parsePartialMarkdownCodeBlock(codeBlock, options);
      expect(result).toEqual(expected);
    });
  });
});
