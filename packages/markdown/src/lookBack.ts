import { LookBackFunction } from "llm-ui/core";
import {
  markdownToVisibleText,
  markdownWithVisibleChars,
} from "./markdownParser";

export const markdownLookBack: LookBackFunction = ({
  output: completeLlmOutput,
  visibleTextLengthTarget,
  isStreamFinished,
}) => {
  console.log("zzz visibleTextLengthTarget", visibleTextLengthTarget);
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
