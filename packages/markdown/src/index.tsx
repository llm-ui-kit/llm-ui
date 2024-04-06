import { LLMOutputReactComponent } from "llm-ui/components";

export const MarkdownComponent: LLMOutputReactComponent = ({ llmOutput }) => {
  return <div>{llmOutput}</div>;
};
