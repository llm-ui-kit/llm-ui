import { csvBlockExample } from "./csvBlockExample";
import { CsvBlockOptions, getOptions } from "./options";

export const csvBlockPrompt = ({
  name,
  examples,
  options,
}: {
  name: string;
  examples: string[][];
  options: CsvBlockOptions;
}): string => {
  const { startChar, endChar, delimiter } = getOptions(options);
  const examplePrompts = examples.map((example) =>
    csvBlockExample(example, options),
  );
  return `You can respond with a ${name} component by wrapping a ${delimiter} separated string in ${startChar}${endChar} tags.\n\nExamples: \n${examplePrompts.join(`\n`)}`;
};
