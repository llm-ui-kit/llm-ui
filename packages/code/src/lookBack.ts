import { LookBackFunction } from "@llm-ui/react";
import { CodeBlockOptions, getOptions } from "./options";
import {
  parseCompleteMarkdownCodeBlock,
  parsePartialMarkdownCodeBlock,
} from "./parse";

export const codeBlockLookBack = (
  userOptions?: Partial<CodeBlockOptions>,
): LookBackFunction => {
  const options = getOptions(userOptions);

  return ({ output, isComplete, visibleTextLengthTarget }) => {
    const parseFunction = isComplete
      ? parseCompleteMarkdownCodeBlock
      : parsePartialMarkdownCodeBlock;
    const { code = "", language, metaString } = parseFunction(output, options);

    const visibleCode = code.slice(0, visibleTextLengthTarget);
    const startEndChar = options.startEndChars[0].repeat(3);
    return {
      output: `${startEndChar}${language ?? ""}${metaString ? ` ${metaString}` : ""}\n${visibleCode}\n${startEndChar}`,
      visibleText: visibleCode,
    };
  };
};
