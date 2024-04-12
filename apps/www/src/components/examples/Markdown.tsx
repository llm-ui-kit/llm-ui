"use client";
import { MarkdownComponent } from "@llm-ui/markdown";
import { type LLMOutputComponent } from "llm-ui/components";

export const Markdown: LLMOutputComponent = (props) => {
  return (
    <MarkdownComponent
      {...props}
      className={"prose dark:prose-invert"}
      components={{
        pre: ({ children }) => (
          <pre className="not-prose shiki">{children}</pre>
        ),
      }}
    />
  );
};
