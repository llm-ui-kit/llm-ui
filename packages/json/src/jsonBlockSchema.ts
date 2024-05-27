import { omit } from "remeda";
import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const jsonBlockSchema = (zodSchema: ZodSchema): string => {
  return JSON.stringify(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    omit(zodToJsonSchema(zodSchema), ["$schema", "additionalProperties"]),
  );
};
