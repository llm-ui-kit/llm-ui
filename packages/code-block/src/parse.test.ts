import { describe, expect, it } from "vitest";
import {
  CodeBlock,
  ParseMarkdownCodeBlockOptions,
  parseFullMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";

describe("parseFullMarkdownCodeBlock", () => {
  const testCases: {
    codeBlock: string;
    options?: ParseMarkdownCodeBlockOptions;
    expected: CodeBlock;
  }[] = [
    {
      codeBlock: "```\nhello\n```",
      expected: { code: "hello", language: undefined, metaString: undefined },
    },
    {
      codeBlock: "```\n\n```",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      codeBlock: "```\n\nhello\n\n```",
      expected: {
        code: "\nhello\n",
        language: undefined,
        metaString: undefined,
      },
    },
    {
      codeBlock: "``````",
      expected: { code: undefined, language: undefined, metaString: undefined },
    },
    {
      codeBlock: "```javascript meta123\nhello\n```",
      expected: {
        code: "hello",
        language: "javascript",
        metaString: "meta123",
      },
    },
    {
      codeBlock: "```typescript meta123\nconsole.log('hello')\n```",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      codeBlock: "~~~typescript meta123\nconsole.log('hello')\n~~~",
      options: { startEndChars: ["~~~", "```"] },
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
  ];

  testCases.forEach(({ codeBlock, options, expected }) => {
    it(`parseFullMarkdownCodeBlock(${codeBlock} ${options ? `,${JSON.stringify(options, null, 2)}` : ""}) === ${JSON.stringify(expected, null, 2)}`, () => {
      const result = parseFullMarkdownCodeBlock(codeBlock, options);
      expect(result).toEqual(expected);
    });
  });
});

describe("parsePartialMarkdownCodeBlock", () => {
  const testCases: {
    codeBlock: string;
    options?: ParseMarkdownCodeBlockOptions;
    expected: CodeBlock;
  }[] = [
    {
      codeBlock: "```\nhello\n",
      expected: { code: "hello", language: undefined, metaString: undefined },
    },
    {
      codeBlock: "```\n\n",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      codeBlock: "``````",
      expected: { code: undefined, language: undefined, metaString: undefined },
    },
    {
      codeBlock: "```javascript meta123\nhello\n```",
      expected: {
        code: "hello",
        language: "javascript",
        metaString: "meta123",
      },
    },
    {
      codeBlock: "```typescript meta123\nconsole.log('hello')\n```",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      codeBlock: "```typescript meta123\nconsole.log('hello')\n",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
    {
      codeBlock: "```typescript meta123\nconsole.log('hello')\n``",
      expected: {
        code: "console.log('hello')",
        language: "typescript",
        metaString: "meta123",
      },
    },
  ];

  testCases.forEach(({ codeBlock, options, expected }) => {
    it(`parseFullMarkdownCodeBlock(${codeBlock} ${options ? `,${options}` : ""}) === ${expected}`, () => {
      const result = parsePartialMarkdownCodeBlock(codeBlock, options);
      expect(result).toEqual(expected);
    });
  });
});
