"use client";
import { cn } from "@/lib/utils";
import { MarkdownComponent } from "@llm-ui/markdown";
import { type LLMOutputComponent } from "llm-ui/core";

export const Markdown: LLMOutputComponent = (props) => {
  return (
    <MarkdownComponent
      {...props}
      className={cn("prose dark:prose-invert", props.className)}
      components={{
        pre: ({ children }) => <pre className="not-prose">{children}</pre>,
      }}
    />
  );
};
