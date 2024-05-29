import { describe, expect, it } from "vitest";
import { ZodSchema, z } from "zod";
import { jsonBlockExample } from "./jsonBlockExample";
import { JsonBlockOptions } from "./options";

type TestCase = {
  name: string;
  schema: ZodSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  example: any;
  options: JsonBlockOptions;
  expected: string;
};

describe("jsonBlockExample", () => {
  const testCases: TestCase[] = [
    {
      name: "top level key",
      schema: z.object({ a: z.string() }),
      example: { a: "example" },
      options: { type: "buttons" },

      expected: '【{"a":"example"}】',
    },
    {
      name: "complex",
      schema: z.object({
        a: z.array(z.object({ a: z.string(), b: z.string() })),
      }),
      example: { a: [{ a: "a", b: "b" }] },
      options: { type: "buttons" },
      expected: '【{"a":[{"a":"a","b":"b"}]}】',
    },
    {
      name: "custom start and end chars",
      schema: z.object({
        a: z.array(z.object({ a: z.string(), b: z.string() })),
      }),
      example: { a: [{ a: "a", b: "b" }] },
      options: { type: "buttons", startChar: "z", endChar: "x" },
      expected: 'z{"a":[{"a":"a","b":"b"}]}x',
    },
  ];

  testCases.forEach(({ name, schema, example, options, expected }) => {
    it(name, () => {
      expect(jsonBlockExample({ schema, example, options })).toEqual(expected);
    });
  });
});
