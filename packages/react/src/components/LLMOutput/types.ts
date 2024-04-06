export type LLMOutputMatch = {
  startIndex: number;
  endIndex: number;
  match: string;
};

export type MaybeLLMOutputMatch = LLMOutputMatch | undefined;

export type LLMOutputReactComponent<Props = {}> = React.FC<
  { llmOutput: string } & Props
>;

export type LLMOutputMatcher = (llmOutput: string) => MaybeLLMOutputMatch;

export type LLMOutputComponent = {
  isPartialMatch: LLMOutputMatcher;
  isFullMatch: LLMOutputMatcher;
  component: LLMOutputReactComponent;
  partialComponent: LLMOutputReactComponent;
};

export type ComponentMatch = {
  component: LLMOutputReactComponent;
  match: LLMOutputMatch;
  priority: number;
};
