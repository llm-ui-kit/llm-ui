export type TokenWithDelay = {
  token: string;
  delayMs: number;
};

export type Probability = {
  prob: number;
};

export type TokenProbability = { tokenChars: number } & Probability;
export type DelayProbability = { delayMs: number } & Probability;

export type UseStreamWithProbabilitiesOptions = UseStreamTokenArrayOptions & {
  tokenCharsProbabilities: TokenProbability[];
  delayMsProbabilities: DelayProbability[];
};

export type UseStreamResponse = {
  output: string;
  reset: () => void;
  pause: () => void;
  start: () => void;
  isStarted: boolean;
  isFinished: boolean;
};

export type UseStreamTokenArrayOptions = {
  autoStart: boolean;
  autoStartDelayMs: number;
  loop: boolean;
  loopDelayMs: number;
  delayMultiplier: number;
};
