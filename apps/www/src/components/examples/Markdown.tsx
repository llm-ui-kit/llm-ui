import { cn } from "@/lib/utils";
import { type LLMOutputComponent } from "@llm-ui/react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownComponent: LLMOutputComponent<Options> = ({
  blockMatch,
  ...props
}) => {
  const markdown = blockMatch.output;
  return (
    <ReactMarkdown
      {...props}
      remarkPlugins={[...(props.remarkPlugins ?? []), remarkGfm]}
    >
      {markdown}
    </ReactMarkdown>
  );
};

export const Markdown: LLMOutputComponent<Options> = (props) => {
  return (
    <MarkdownComponent
      {...props}
      className={cn(
        "prose dark:prose-invert prose-code:before:hidden prose-code:after:hidden",
        props.className,
      )}
      components={{
        pre: ({ children }) => <pre className="not-prose">{children}</pre>,
      }}
    />
  );
};
