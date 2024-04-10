import { LLMOutputComponent, LookBackFunction } from "llm-ui/components";
import Markdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  markdownToVisibleText,
  markdownWithVisibleChars,
} from "./markdownParser";

export const markdownLookBack: LookBackFunction = ({
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

export const MarkdownComponent: LLMOutputComponent<Options> = ({
  llmOutput,
  ...props
}) => {
  return (
    <Markdown
      {...props}
      remarkPlugins={[...(props.remarkPlugins ?? []), remarkGfm]}
    >
      {llmOutput}
    </Markdown>
  );
};
