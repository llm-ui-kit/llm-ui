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
    {
      name: "single char",
      input: "t",
      options: { type: "t" },
      expected: ["t"],
    },
    {
      name: "multiple chars",
      input: "type",
      options: { type: "type" },
      expected: ["type"],
    },
    {
      name: "separated",
      input: "t,abc,def",
      options: { type: "t" },
      expected: ["t", "abc", "def"],
    },
    {
      name: "leading whitespace",
      input: "t, abc,def",
      options: { type: "t" },
      expected: ["t", " abc", "def"],
    },
    {
      name: "trailing whitespace",
      input: "t,abc,def ",
      options: { type: "t" },
      expected: ["t", "abc", "def "],
    },
    {
      name: "trailing delimiter",
      input: "t,abc,",
      options: { type: "t" },
      expected: ["t", "abc"],
    },
    {
      name: "separated custom delimiter",
      input: "t;abc;def",
      options: { type: "t", delimiter: ";" },
      expected: ["t", "abc", "def"],
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = parseCsv(input, options);
      expect(result).toEqual(expected);
    });
  });
});
