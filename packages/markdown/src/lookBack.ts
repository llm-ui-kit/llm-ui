import { LookBackFunction } from "@llm-ui/react";
import {
  markdownToVisibleText,
  markdownWithVisibleChars,
} from "./markdownParser";

export const markdownLookBack: () => LookBackFunction =
  () =>
  ({
    output: completeLlmOutput,
    visibleTextLengthTarget,
    isStreamFinished,
  }) => {
    const output = markdownWithVisibleChars(
      completeLlmOutput,
      visibleTextLengthTarget,
      isStreamFinished,
    );
    const visibleText = markdownToVisibleText(output, isStreamFinished);
    return {
      output,
      visibleText,
    };
  };
