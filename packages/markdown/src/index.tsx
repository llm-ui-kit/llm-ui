import { LLMOutputReactComponent } from "llm-ui/components";
import Markdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownComponent: LLMOutputReactComponent<Options> = ({
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
