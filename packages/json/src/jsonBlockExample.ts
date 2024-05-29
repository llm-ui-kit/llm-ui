import z, { ZodSchema, ZodTypeAny } from "zod";
import { JsonBlockOptions, getOptions } from "./options";

export const jsonBlockExample = <
  Schema extends ZodTypeAny = ZodSchema<undefined>,
>({
  schema,
  example,
  options,
}: {
  schema: Schema;
  example: z.infer<Schema>;
  options: JsonBlockOptions;
}): string => {
  // throw if example does not match schema
  const parsed = schema.parse(example);
  const { startChar, endChar } = getOptions(options);
  return `${startChar}${JSON.stringify(parsed)}${endChar}`;
};
