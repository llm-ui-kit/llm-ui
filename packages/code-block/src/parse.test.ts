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
      codeBlock: "```javascript\nhello\n```",
      expected: {
        code: "hello",
        language: "javascript",
        metaString: undefined,
      },
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
    // todo: name
    it(`parseFullMarkdownCodeBlock(${codeBlock} ${options ? `,${JSON.stringify(options, null, 2)}` : ""}) === ${JSON.stringify(expected, null, 2)}`, () => {
      const result = parseFullMarkdownCodeBlock(codeBlock, options);
      expect(result).toEqual(expected);
    });
  });
});

describe("parsePartialMarkdownCodeBlock", () => {
  const testCases: {
    name: string;
    codeBlock: string;
    options?: ParseMarkdownCodeBlockOptions;
    expected: CodeBlock;
  }[] = [
    {
      name: "partial",
      codeBlock: "```\nhello\n",
      expected: { code: "hello\n", language: undefined, metaString: undefined },
    },
    {
      name: "partial with 1 newlines",
      codeBlock: "```\n",
      expected: { code: "", language: undefined, metaString: undefined },
    },
    {
      name: "partial with 2 newlines",
      codeBlock: "```\n\n",
      expected: { code: "\n", language: undefined, metaString: undefined },
    },
    {
      name: "single line full",
      codeBlock: "``````",
      expected: { code: undefined, language: undefined, metaString: undefined },
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
      codeBlock: "```typescript meta123\nconsole.log('hello')\n",
      expected: {
        code: "console.log('hello')\n",
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
        code: "console.log('hello')\n``",
        language: "typescript",
        metaString: "meta123",
      },
    },
  ];

  testCases.forEach(({ name, codeBlock, options, expected }) => {
    it(name, () => {
      const result = parsePartialMarkdownCodeBlock(codeBlock, options);
      expect(result).toEqual(expected);
    });
  });
});
