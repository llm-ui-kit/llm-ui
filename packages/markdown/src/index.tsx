import { LLMOutputReactComponent } from "llm-ui/components";
import Markdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownComponent: LLMOutputReactComponent<Options> = ({
  match,
  ...props
}) => {
  return (
    <Markdown
      {...props}
      remarkPlugins={[...(props.remarkPlugins ?? []), remarkGfm]}
    >
      {match.output}
    </Markdown>
  );
};
