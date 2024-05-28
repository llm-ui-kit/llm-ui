import { csvBlockExample } from "./csvBlockExample";
import { CsvBlockOptions, getOptions } from "./options";

export const csvBlockPrompt = ({
  name,
  examples,
  userOptions,
}: {
  name: string;
  examples: string[][];
  userOptions?: Partial<CsvBlockOptions>;
}): string => {
  const { startChar, endChar, delimiter } = getOptions(userOptions);
  const examplePrompts = examples.map((example) =>
    csvBlockExample(example, userOptions),
  );
  return `You can respond with a ${name} component by wrapping a ${delimiter} separated string in ${startChar}${endChar} tags.\n\nExamples: \n${examplePrompts.join(`\n`)}`;
};
