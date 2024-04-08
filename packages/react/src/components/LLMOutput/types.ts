export type LLMOutputMatch = {
  startIndex: number;
  endIndex: number;
  output: string;
  visibleOutput: string;
};

export type MaybeLLMOutputMatch = LLMOutputMatch | undefined;

export type LLMOutputReactComponent<Props = any> = React.FC<
  { match: LLMOutputMatch } & Props
>;

export type LLMOutputMatcher = (llmOutput: string) => MaybeLLMOutputMatch;

export type LLMOutputComponent = {
  isPartialMatch: LLMOutputMatcher;
  isCompleteMatch: LLMOutputMatcher;
  completeComponent: LLMOutputReactComponent;
  partialComponent: LLMOutputReactComponent;
};

export type ComponentMatch = {
  component: LLMOutputReactComponent;
  match: LLMOutputMatch;
  priority: number;
};
