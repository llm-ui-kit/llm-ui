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

export type LLMOutputComponent<Props = any> = React.FC<
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

export type LLMOutputFallbackBlock = {
  component: LLMOutputComponent;
  lookBack: LookBackFunction;
};

export type LLMOutputBlock = {
  isPartialMatch: LLMOutputMatcher;
  isCompleteMatch: LLMOutputMatcher;
} & LLMOutputFallbackBlock;

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
