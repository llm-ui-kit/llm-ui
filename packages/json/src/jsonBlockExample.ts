import z, { ZodSchema, ZodTypeAny } from "zod";
import { JsonBlockOptions, getOptions } from "./options";

export const jsonBlockExample = <
  Schema extends ZodTypeAny = ZodSchema<undefined>,
>(
  schema: Schema,
  example: z.infer<Schema>,
  userOptions?: Partial<JsonBlockOptions>,
): string => {
  // throw if example does not match schema
  const parsed = schema.parse(example);
  const { startChar, endChar } = getOptions(userOptions);
  return `${startChar}${JSON.stringify(parsed)}${endChar}`;
};
