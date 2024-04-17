"use client";
import type { ShikiCodeBlockComponent } from "@llm-ui/code-block";
import {
  codeBlockCompleteMatcher,
  codeBlockLookBack,
  parseCompleteMarkdownCodeBlock,
} from "@llm-ui/code-block";
import { type LLMOutputBlock } from "llm-ui/core";
import { codeBlockPartialMatcher } from "node_modules/@llm-ui/code-block/src/matchers";
import { CodeBlock } from "../ui/custom/CodeBlock";

const ShikiBlockComponent: ShikiCodeBlockComponent = ({
  llmOutput: markdownCodeBlock,
}) => {
  const { code, language } = parseCompleteMarkdownCodeBlock(markdownCodeBlock);
  if (!code) {
    return undefined;
  }
  return (
    <CodeBlock
      className="my-4"
      code={code}
      codeToHtmlProps={{ lang: language }}
    />
  );
};

export const codeBlockBlock: LLMOutputBlock = {
  isCompleteMatch: codeBlockCompleteMatcher(),
  isPartialMatch: codeBlockPartialMatcher(),
  lookBack: codeBlockLookBack(),
  component: ShikiBlockComponent,
};
