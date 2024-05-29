import z, { ZodSchema, ZodTypeAny } from "zod";
import { jsonBlockExample } from "./jsonBlockExample";
import { jsonBlockSchema } from "./jsonBlockSchema";
import { JsonBlockOptions, getOptions } from "./options";

export const jsonBlockPrompt = <
  Schema extends ZodTypeAny = ZodSchema<undefined>,
>({
  name,
  schema,
  examples,
  options,
}: {
  name: string;
  schema: Schema;
  examples: z.infer<Schema>[];
  options: JsonBlockOptions;
}): string => {
  const { startChar, endChar } = getOptions(options);
  const schemaPrompt = jsonBlockSchema(schema);
  const examplePrompts = examples.map((example) =>
    jsonBlockExample({ schema, example, options }),
  );
  return `You can respond with a ${name} component by wrapping JSON in ${startChar}${endChar}.\nThe JSON schema is:\n${schemaPrompt}\n\nExamples: \n${examplePrompts.join(`\n`)}`;
};
