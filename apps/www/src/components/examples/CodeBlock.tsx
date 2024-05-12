import { HIDDEN_CHAR } from "@/constants/constants";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
  parseCompleteMarkdownCodeBlock,
} from "@llm-ui/code";
import { type LLMOutputBlock, type LLMOutputComponent } from "@llm-ui/react";
import { CodeBlock } from "../ui/custom/CodeBlock";

const ShikiBlockComponent: LLMOutputComponent = ({ blockMatch }) => {
  const { code, language } = parseCompleteMarkdownCodeBlock(
    blockMatch.output.replaceAll(HIDDEN_CHAR, ""),
  );
  if (!code) {
    return undefined;
  }
  return (
    <CodeBlock
      className="my-4"
      code={code}
      codeToHtmlOptions={{ lang: language }}
    />
  );
};

export const codeBlockBlock: LLMOutputBlock = {
  findCompleteMatch: findCompleteCodeBlock(),
  findPartialMatch: findPartialCodeBlock(),
  lookBack: codeBlockLookBack(),
  component: ShikiBlockComponent,
};
