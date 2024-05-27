import { describe, expect, it } from "vitest";
import { ZodSchema, z } from "zod";
import { jsonBlockSchema } from "./jsonBlockSchema";

type TestCase = {
  name: string;
  schema: ZodSchema;
  expected: string;
};

describe("jsonBlockSchema", () => {
  const testCases: TestCase[] = [
    {
      name: "top level key",
      schema: z.object({ a: z.string() }),
      expected:
        '{"type":"object","properties":{"a":{"type":"string"}},"required":["a"]}',
    },
    {
      name: "complex",
      schema: z.object({ a: z.array(z.object({ b: z.string() })) }),
      expected:
        '{"type":"object","properties":{"a":{"type":"array","items":{"type":"object","properties":{"b":{"type":"string"}},"required":["b"],"additionalProperties":false}}},"required":["a"]}',
    },
  ];

  testCases.forEach(({ name, schema, expected }) => {
    it(name, () => {
      expect(jsonBlockSchema(schema)).toEqual(expected);
    });
  });
});
