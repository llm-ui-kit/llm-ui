import { describe, expect, it } from "vitest";
import { ZodSchema, z } from "zod";
import { customBlockSchema } from "./customBlockSchema";

type TestCase = {
  name: string;
  schema: ZodSchema;
  expected: string;
};

describe("customBlockSchema", () => {
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
      expect(customBlockSchema(schema)).toEqual(expected);
    });
  });
});
