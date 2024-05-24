import z, { ZodSchema, ZodTypeAny } from "zod";
import { customBlockExample } from "./customBlockExample";
import { customBlockSchema } from "./customBlockSchema";
import { CustomBlockOptions, getOptions } from "./options";

export const customBlockPrompt = <
  Schema extends ZodTypeAny = ZodSchema<undefined>,
>({
  name,
  schema,
  examples,
  userOptions,
}: {
  name: string;
  schema: Schema;
  examples: z.infer<Schema>[];
  userOptions?: Partial<CustomBlockOptions>;
}): string => {
  const { startChar, endChar } = getOptions(userOptions);
  const schemaPrompt = customBlockSchema(schema);
  const examplePrompts = examples.map((example) =>
    customBlockExample(schema, example, userOptions),
  );
  return `You can respond with a ${name} component by wrapping JSON in ${startChar}${endChar}. The schema is:\n${schemaPrompt}\n\nExamples: \n${examplePrompts.join(`\n`)}`;
};
