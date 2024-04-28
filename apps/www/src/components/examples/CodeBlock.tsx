import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  parseCompleteMarkdownCodeBlock,
} from "@llm-ui/code";
import {
  type LLMOutputBlock,
  type LLMOutputComponent,
} from "@llm-ui/react/core";
import { findPartialCodeBlock } from "node_modules/@llm-ui/code/src/matchers";
import { CodeBlock } from "../ui/custom/CodeBlock";

const ShikiBlockComponent: LLMOutputComponent = ({ blockMatch }) => {
  const { code, language } = parseCompleteMarkdownCodeBlock(blockMatch.output);
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
  findCompleteMatch: findCompleteCodeBlock(),
  findPartialMatch: findPartialCodeBlock(),
  lookBack: codeBlockLookBack(),
  component: ShikiBlockComponent,
};
