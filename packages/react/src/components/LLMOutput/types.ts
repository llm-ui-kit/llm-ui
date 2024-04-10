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
  throttle?: ThrottleFunction;
};

export type LLMOutputComponent = {
  isPartialMatch: LLMOutputMatcher;
  isCompleteMatch: LLMOutputMatcher;
} & LLMOutputFallbackComponent;

export type ComponentMatch = {
  component: LLMOutputFallbackComponent;
  match: LLMOutputMatchWithLookBack;
  priority: number;
};

export type ThrottleParams = {
  rawLLMOutput: string;
  currentLLMOutput: string;
  allLLMOutput: string;
  visibleChars: string;
  allVisibleChars: string;
  timeInMsSinceStart: number;
  isStreamFinished: boolean;
};

export type ThrottleResponse = {
  targetVisibleCharsLength: number;
  skip: boolean;
};

export type ThrottleFunction = (
  params: ThrottleParams,
) => Promise<ThrottleResponse>;
