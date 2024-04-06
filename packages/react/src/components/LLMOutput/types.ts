export type Match = {
  startIndex: number;
  endIndex: number;
  match: string;
};

export type MaybeMatch = Match | undefined;

export type LLMOutputReactComponent = React.FC<{ llmOutput: string }>;

export type LLMOutputComponent = {
  partialMatch: (llmOutput: string) => MaybeMatch;
  fullMatch: (llmOutput: string) => MaybeMatch;
  component: LLMOutputReactComponent;
  partialComponent: LLMOutputReactComponent;
};

export type LLMOutputProps = {
  llmOutput: string;
  components: LLMOutputComponent[];
  fallbackComponent: LLMOutputReactComponent;
};

export type ComponentMatch = {
  component: LLMOutputReactComponent;
  match: Match;
  priority: number;
};
