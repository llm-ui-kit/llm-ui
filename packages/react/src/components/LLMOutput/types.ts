export type LLMOutputMatch = {
  startIndex: number;
  endIndex: number;
  outputRaw: string;
};

export type LLMOutputMatchWithLookBack = LLMOutputMatch & {
  outputAfterLookback: string;
  visibleText: string;
};

export type MaybeLLMOutputMatch = LLMOutputMatch | undefined;

export type LLMOutputReactComponent<Props = any> = React.FC<
  { llmOutput: string; isComplete: boolean } & Props
>;

export type LLMOutputMatcher = (llmOutput: string) => MaybeLLMOutputMatch;

export type LookBack = {
  output: string;
  visibleText: string;
};

export type LookBackFunctionParams = {
  output: string;
  isComplete: boolean;
  visibleTextLengthTarget: number;
  isStreamFinished: boolean;
};

export type LookBackFunction = (params: LookBackFunctionParams) => LookBack;

export type LLMOutputFallbackComponent = {
  component: LLMOutputReactComponent;
  lookBack: LookBackFunction;
};

export type LLMOutputComponent = {
  isPartialMatch: LLMOutputMatcher;
  isCompleteMatch: LLMOutputMatcher;
} & LLMOutputFallbackComponent;

export type ThrottleParams = {
  outputRaw: string;
  outputRendered: string;
  outputAll: string;
  visibleText: string;
  visibleTextAll: string;
  timeInMsSinceStart: number;
  timeInMsSinceLastRender: number;
  isStreamFinished: boolean;
};

export type ThrottleResponse = {
  visibleTextLengthTarget: number;
  skip: boolean;
};

export type ThrottleFunction = (params: ThrottleParams) => ThrottleResponse;
