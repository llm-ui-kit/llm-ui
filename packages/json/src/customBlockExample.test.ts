import { describe, expect, it } from "vitest";
import { ZodSchema, z } from "zod";
import { customBlockExample } from "./customBlockExample";
import { CustomBlockOptions } from "./options";

type TestCase = {
  name: string;
  schema: ZodSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  example: any;
  options?: Partial<CustomBlockOptions>;
  expected: string;
};

describe("customBlockExample", () => {
  const testCases: TestCase[] = [
    {
      name: "top level key",
      schema: z.object({ a: z.string() }),
      example: { a: "example" },
      expected: '【{"a":"example"}】',
    },
    {
      name: "complex",
      schema: z.object({
        a: z.array(z.object({ a: z.string(), b: z.string() })),
      }),
      example: { a: [{ a: "a", b: "b" }] },
      expected: '【{"a":[{"a":"a","b":"b"}]}】',
    },
  ];

  testCases.forEach(({ name, schema, example, expected }) => {
    it(name, () => {
      expect(customBlockExample(schema, example)).toEqual(expected);
    });
  });
});
