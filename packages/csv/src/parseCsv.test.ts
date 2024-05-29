import { describe, expect, it } from "vitest";
import { CsvBlockOptions } from "./options";
import { parseCsv } from "./parseCsv";

type TestCase = {
  name: string;
  input: string;
  expected: string[];
  options: CsvBlockOptions;
};

describe("parseCsv", () => {
  const testCases: TestCase[] = [
    { name: "single char", input: "a", expected: ["a"] },
    { name: "multiple chars", input: "abc", expected: ["abc"] },
    { name: "separated", input: "abc,def", expected: ["abc", "def"] },
    {
      name: "leading whitespace",
      input: " abc,def",
      expected: [" abc", "def"],
    },
    {
      name: "trailing whitespace",
      input: "abc,def ",
      expected: ["abc", "def "],
    },
    {
      name: "trailing delimiter",
      input: "abc,",
      expected: ["abc"],
    },
    {
      name: "separated custom delimiter",
      input: "abc;def",
      options: { delimiter: ";" },
      expected: ["abc", "def"],
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = parseCsv(input, options);
      expect(result).toEqual(expected);
    });
  });
});
