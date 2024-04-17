import { LLMOutputComponent } from "llm-ui/core";
import Markdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownComponent: LLMOutputComponent<Options> = ({
  blockMatch,
  ...props
}) => {
  return (
    <Markdown
      {...props}
      remarkPlugins={[...(props.remarkPlugins ?? []), remarkGfm]}
    >
      {blockMatch.output}
    </Markdown>
  );
};
