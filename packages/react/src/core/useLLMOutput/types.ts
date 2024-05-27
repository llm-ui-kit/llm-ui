export type LLMOutputMatch = {
  startIndex: number;
  endIndex: number;
  outputRaw: string;
};

export type BlockMatch = MatchBase & LLMOutputMatchWithLookBack;

type MatchBase = {
  block: LLMOutputFallbackBlock;
  priority: number;
  llmOutput: string;
  isComplete: boolean;
};

export type BlockMatchNoLookback = MatchBase & {
  match: LLMOutputMatch;
};

export type LLMOutputMatchWithLookBack = LLMOutputMatch & {
  output: string;
  visibleText: string;
  isVisible: boolean;
};

export type MaybeLLMOutputMatch = LLMOutputMatch | undefined;

export type LLMOutputComponent<Props = unknown> = React.FC<
  Props & { blockMatch: BlockMatch }
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
  findPartialMatch: LLMOutputMatcher;
  findCompleteMatch: LLMOutputMatcher;
} & LLMOutputFallbackBlock;

export type ThrottleParams = {
  outputRaw: string;
  outputRendered: string;
  outputAll: string;
  visibleText: string;
  visibleTextAll: string;
  isStreamFinished: boolean;
  frameCount: number;
  frameTime: DOMHighResTimeStamp;
  frameTimePrevious: DOMHighResTimeStamp | undefined;
  startStreamTime: DOMHighResTimeStamp;
  finishStreamTime: DOMHighResTimeStamp | undefined;
  visibleTextLengthsAll: number[];
  outputLengths: number[];
  visibleTextIncrements: number[];
  visibleTextLengthTarget: number;
};

export type ThrottleResponse = {
  visibleTextIncrement: number;
};

export type ThrottleFunction = (params: ThrottleParams) => ThrottleResponse;
