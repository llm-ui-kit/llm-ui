import { LookBackFunction } from "@llm-ui/react";
import { removeStartEndChars } from "@llm-ui/shared";
import { CsvBlockOptions, getOptions } from "./options";
import { parseCsv } from "./parseCsv";

export const csvBlockLookBack = (
  options: CsvBlockOptions,
): LookBackFunction => {
  const completeOptions = getOptions(options);
  const {
    allIndexesVisible,
    visibleIndexes: visibleIndexesOption,
    delimiter,
  } = completeOptions;

  return ({ output, isComplete, visibleTextLengthTarget }) => {
    const array = parseCsv(
      removeStartEndChars(output, completeOptions),
      completeOptions,
    );
    const visibleIndexes = allIndexesVisible
      ? array.map((_, i) => i).slice(1) // Skip index 0 as it is the type
      : visibleIndexesOption;

    let charsRemaining = visibleTextLengthTarget;
    const outputArray = array.reduce((acc, item, index) => {
      if (!visibleIndexes.includes(index)) {
        return [...acc, item];
      }
      const toKeep = Math.max(Math.min(charsRemaining, item.length), 0);
      charsRemaining -= toKeep;
      return [...acc, item.slice(0, toKeep)];
    }, [] as string[]);

    const visibleArray = outputArray.filter((_, index) =>
      visibleIndexes.includes(index),
    );
    return {
      output: outputArray.join(delimiter),
      visibleText:
        visibleArray.length === 0
          ? isComplete
            ? " "
            : ""
          : visibleArray.join(""),
    };
  };
};
