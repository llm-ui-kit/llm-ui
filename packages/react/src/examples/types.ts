export type TokenWithDelay = {
  token: string;
  delayMs: number;
};

export type Probability = {
  prob: number;
};

export type TokenProbability = { tokenChars: number } & Probability;
export type DelayProbability = { delayMs: number } & Probability;

export type ProbabilityOptions = {
  tokenCharsProbabilities: TokenProbability[];
  delayMsProbabilities: DelayProbability[];
};
export type UseStreamWithProbabilitiesOptions = UseStreamTokenArrayOptions &
  ProbabilityOptions;

export type UseStreamResponse = {
  output: string;
  reset: () => void;
  pause: () => void;
  start: () => void;
  isStreamStarted: boolean;
  isStreamFinished: boolean;
  isPlaying: boolean;
};

export type UseStreamTokenArrayOptions = {
  autoStart: boolean;
  autoStartDelayMs: number;
  startIndex: number;
  delayMultiplier: number;
};
