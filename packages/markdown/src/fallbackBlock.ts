import { LLMOutputFallbackBlock } from "llm-ui/components";
import { MarkdownComponent } from "./MarkdownComponent";
import { markdownLookBack } from "./lookBack";

export const markdownFallbackBlock: LLMOutputFallbackBlock = {
  lookBack: markdownLookBack,
  component: MarkdownComponent,
};
